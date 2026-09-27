"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import { FormField, TextField, TextArea, SelectField, Checkbox, Switch, SearchField, PasswordField, RadioGroup, SegmentedControl, NumberField, Rating, ColorPicker, TagInput, FileDropzone, AsyncForm } from "@/mizu";

export function FormFieldDemo() {
  return <FormField label="Project" hint="A name people can find"><input className="mizu-input" /></FormField>;
}

export function TextFieldDemo() {
  return <TextField label="Project name" name="project" required placeholder="Untitled project" hint="Visible to your collaborators." />;
}

export function TextAreaDemo() {
  return <TextArea label="Release notes" name="notes" rows={4} placeholder="What changed?" />;
}

export function SelectFieldDemo() {
  return <SelectField label="Visibility" defaultValue="private"><option value="private">Private</option><option value="public">Public</option></SelectField>;
}

export function CheckboxDemo() {
  return <Checkbox label="Include source maps" hint="Useful when debugging production." name="sourcemaps" defaultChecked />;
}

export function SwitchDemo() {
  return <Switch label="Email notifications" name="notifications" defaultChecked />;
}

export function SearchFieldDemo() {
  const [query, setQuery] = useState("");
  return <SearchField value={query} onValueChange={setQuery} label="Find a component" />;
}

export function PasswordFieldDemo() {
  return <PasswordField label="Password" name="password" autoComplete="new-password" />;
}

export function RadioGroupDemo() {
  const [value, setValue] = useState("local");
  return <RadioGroup label="Storage" value={value} onValueChange={setValue} options={[{value:"local",label:"Local",description:"On this device"},{value:"cloud",label:"Cloud",description:"Across devices"}]} />;
}

export function SegmentedControlDemo() {
  const [value, setValue] = useState("week");
  return <SegmentedControl label="Period" value={value} onValueChange={setValue} options={[{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"}]} />;
}

export function NumberFieldDemo() {
  const [value, setValue] = useState(3);
  return <NumberField label="Seats" value={value} onValueChange={setValue} min={1} max={12} />;
}

export function RatingDemo() {
  const [value, setValue] = useState(3);
  return <Rating label="How useful was this?" value={value} onValueChange={setValue} />;
}

export function ColorPickerDemo() {
  const [value, setValue] = useState("#ff4d1c");
  return <ColorPicker label="Signal color" value={value} onValueChange={setValue} />;
}

export function TagInputDemo() {
  const [value, setValue] = useState(["interface", "motion"]);
  return <TagInput label="Topics" value={value} onValueChange={setValue} />;
}

export function FileDropzoneDemo() {
  const [files, setFiles] = useState<File[]>([]);
  return <><FileDropzone label="Attach artwork" accept="image/*,.svg" multiple onFilesChange={setFiles} /><p>{files.map(f => f.name).join(", ")}</p></>;
}

export function AsyncFormDemo() {
  return <AsyncForm onSubmit={async (data) => { localStorage.setItem("mizu-demo-name", String(data.get("name"))); }} successMessage="Saved on this device."><TextField label="Display name" name="name" required /><button type="submit" className="mizu-text-button">Save locally</button></AsyncForm>;
}
