import React from "react";
import { colors } from "../theme/colors.js";
import { BORDER_RADIUS, FONT_FAMILY, TRANSITION } from "../theme/styles.js";

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: colors.textMuted,
  marginBottom: 4,
  display: "block",
  fontFamily: FONT_FAMILY,
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  backgroundColor: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  fontSize: 13,
  fontFamily: FONT_FAMILY,
  outline: "none",
  boxSizing: "border-box",
  transition: TRANSITION,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 10,
};

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  readOnly,
}) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      readOnly={readOnly}
      style={{
        ...inputBase,
        ...(readOnly ? { opacity: 0.6, cursor: "default" } : {}),
      }}
    />
  </div>
);

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  readOnly,
}) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        ...inputBase,
        ...(readOnly ? { opacity: 0.6, cursor: "default" } : {}),
      }}
    />
  </div>
);

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  value,
  onChange,
  rows = 3,
}) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{
        ...inputBase,
        resize: "vertical",
      }}
    />
  </div>
);

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{
          flex: 1,
          accentColor: colors.accent,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 4,
          height: 6,
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: colors.text,
          minWidth: 36,
          textAlign: "right",
          fontFamily: FONT_FAMILY,
        }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  </div>
);

interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleInput: React.FC<ToggleInputProps> = ({
  label,
  value,
  onChange,
}) => (
  <div
    style={{
      ...fieldStyle,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.filter = "";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.filter = "brightness(0.9)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.filter = "brightness(1.2)";
      }}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        backgroundColor: value ? colors.accent : colors.border,
        cursor: "pointer",
        position: "relative",
        transition: TRANSITION,
        padding: 0,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: colors.text,
          position: "absolute",
          top: 2,
          left: value ? 18 : 2,
          transition: "left 150ms ease",
        }}
      />
    </button>
  </div>
);

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accent; el.style.backgroundColor = colors.surfaceHover; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.border; el.style.backgroundColor = colors.bg; }}
      onMouseDown={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accentHover; el.style.backgroundColor = colors.surface; }}
      onMouseUp={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = colors.accent; el.style.backgroundColor = colors.surfaceHover; }}
      style={{
        ...inputBase,
        cursor: "pointer",
        transition: TRANSITION,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  label,
  value,
  onChange,
}) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          border: `1px solid ${colors.border}`,
          borderRadius: BORDER_RADIUS,
          backgroundColor: colors.bg,
          cursor: "pointer",
        }}
      />
      <span style={{ fontSize: 12, color: colors.text }}>{value}</span>
    </div>
  </div>
);
