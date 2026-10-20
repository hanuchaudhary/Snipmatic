import {
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  useId,
  useState,
} from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

type LabelInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder"
> & {
  label: string;
};

export const LabelInput = forwardRef<HTMLInputElement, LabelInputProps>(
  function LabelInput(
    {
      label,
      type = "text",
      value,
      defaultValue,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const id = props.id ?? generatedId;
    const [focused, setFocused] = useState(false);
    const [show, setShow] = useState(false);
    const [flip, setFlip] = useState(0);
    const lifted = focused || String(value ?? defaultValue ?? "").length > 0;
    const secret = type === "password";

    return (
      <div
        className={cn("lbi", className)}
        data-up={lifted}
        data-focus={focused}
      >
        <div className="lbi-box">
          <label className="lbi-label" htmlFor={id}>
            {[...label].map((letter, index) => (
              <span key={index} style={{ "--i": index } as CSSProperties}>
                {letter}
              </span>
            ))}
          </label>
          <input
            {...props}
            ref={ref}
            id={id}
            className="lbi-field"
            data-flip={flip % 2}
            type={secret ? (show ? "text" : "password") : type}
            value={value}
            defaultValue={defaultValue}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
          {secret && (
            <button
              className="lbi-eye"
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                setShow(!show);
                setFlip((current) => current + 1);
              }}
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
      </div>
    );
  }
);
