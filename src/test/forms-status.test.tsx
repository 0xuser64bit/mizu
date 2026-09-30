import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TextField,
  PasswordField,
  Switch,
  RadioGroup,
  NumberField,
  TagInput,
  FileDropzone,
  AsyncForm,
  AsyncButton,
  Progress,
  AsyncBoundary,
  TaskProgress,
} from "@/mizu";

describe("form and status contracts", () => {
  it("links labels, descriptions and errors without colliding", () => {
    render(
      <>
        <TextField label="Name" hint="Public name" error="Required" />
        <TextField label="Name" />
      </>,
    );
    const inputs = screen.getAllByLabelText("Name");
    expect(inputs[0].id).not.toBe(inputs[1].id);
    expect(inputs[0]).toHaveAccessibleDescription("Public name Required");
    expect(inputs[0]).toHaveAttribute("aria-invalid", "true");
  });
  it("keeps a secret intact while visibility changes", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Secret" defaultValue="mizu" />);
    await user.click(screen.getByRole("button", { name: "Show secret" }));
    expect(screen.getByLabelText("Secret")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Secret")).toHaveValue("mizu");
  });
  it("uses native toggle and radio semantics", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <>
        <Switch label="Notifications" />
        <RadioGroup
          label="Store"
          value="a"
          onValueChange={change}
          options={[
            { value: "a", label: "Local" },
            { value: "b", label: "Cloud" },
          ]}
        />
      </>,
    );
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Cloud" }));
    expect(change).toHaveBeenCalledWith("b");
  });
  it("clamps numeric bounds and avoids decimal floating-point residue", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const { rerender } = render(
      <NumberField
        label="Amount"
        value={0.2}
        onValueChange={change}
        min={0}
        max={0.3}
        step={0.1}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Increase amount" }));
    expect(change).toHaveBeenCalledWith(0.3);
    rerender(
      <NumberField
        label="Amount"
        value={0.3}
        onValueChange={change}
        min={0}
        max={0.3}
        step={0.1}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Increase amount" }),
    ).toBeDisabled();
  });
  it("rejects duplicate tags and reports capacity", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <TagInput
        label="Tags"
        value={["Mizu"]}
        onValueChange={change}
        maxTags={1}
      />,
    );
    await user.type(screen.getByLabelText("Tags"), "mizu{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("already exists");
    await user.clear(screen.getByLabelText("Tags"));
    await user.type(screen.getByLabelText("Tags"), "React{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("at most 1");
    expect(change).not.toHaveBeenCalled();
  });
  it("validates dropped types and sizes, rather than trusting the file-input accept attribute", () => {
    const change = vi.fn();
    render(
      <FileDropzone
        label="Artwork"
        accept="image/*,.svg"
        maxSize={5}
        multiple
        onFilesChange={change}
      />,
    );
    const png = new File(["ok"], "a.png", { type: "image/png" });
    fireEvent.drop(screen.getByRole("button"), {
      dataTransfer: {
        files: [
          png,
          new File(["ok"], "a.txt", { type: "text/plain" }),
          new File(["too large"], "b.svg", { type: "image/svg+xml" }),
        ],
      },
    });
    expect(change).toHaveBeenCalledWith([png]);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "unsupported file type",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("exceeds");
  });
  it("offers one labelled control, hiding the file input behind it", () => {
    const { container } = render(
      <FileDropzone label="Artwork" onFilesChange={() => {}} />,
    );
    expect(container.querySelector('input[type="file"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByRole("button")).toHaveAccessibleName(/Artwork/);
  });
  it("preserves form input after a rejected save", async () => {
    const user = userEvent.setup();
    render(
      <AsyncForm
        onSubmit={async () => {
          throw new Error("Save denied");
        }}
      >
        <TextField label="Name" name="name" defaultValue="Mizu" />
        <button type="submit">Save</button>
      </AsyncForm>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Save denied");
    expect(screen.getByLabelText("Name")).toHaveValue("Mizu");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });
  it("awaits actual action completion and aborts pending work on unmount", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    let signal!: AbortSignal;
    const action = vi.fn((s: AbortSignal) => {
      signal = s;
      return new Promise<void>((r) => {
        resolve = r;
      });
    });
    const { unmount } = render(<AsyncButton action={action}>Save</AsyncButton>);
    await user.click(screen.getByRole("button", { name: /Save/ }));
    expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => resolve());
  });
  it("completes only when the promise resolves", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    render(
      <AsyncButton
        action={() =>
          new Promise<void>((r) => {
            resolve = r;
          })
        }
        successLabel="Saved"
      >
        Save
      </AsyncButton>,
    );
    await user.click(screen.getByRole("button", { name: /Save/ }));
    expect(screen.queryByText("Saved")).toBeNull();
    await act(async () => resolve());
    expect(screen.getByRole("button", { name: "Saved" })).toBeEnabled();
  });
  it("distinguishes indeterminate progress, empty content and partial tasks", () => {
    render(
      <>
        <Progress label="Unknown progress" />
        <AsyncBoundary state="empty">
          <p>Ready</p>
        </AsyncBoundary>
        <TaskProgress
          steps={[
            { id: "a", label: "Validate", state: "complete" },
            { id: "b", label: "Build", state: "error" },
          ]}
        />
      </>,
    );
    expect(
      screen.getByRole("progressbar", { name: "Unknown progress" }),
    ).not.toHaveAttribute("value");
    expect(screen.getByText("Nothing here yet")).toBeTruthy();
    expect(
      screen.getByRole("progressbar", { name: "Task progress" }),
    ).toHaveAttribute("value", "1");
  });
});
