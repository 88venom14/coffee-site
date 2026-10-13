import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectOption = { value: string; label: string };

export function CustomSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + direction + options.length) % options.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  }

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        className="custom-select-trigger"
        type="button"
        ref={triggerRef}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openList();
          }
        }}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="custom-select-list"
          id={id}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${id}-option-${activeIndex}`}
          ref={listRef}
          tabIndex={0}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => (
            <button
              className={index === selectedIndex ? 'custom-select-option selected' : 'custom-select-option'}
              id={`${id}-option-${index}`}
              key={option.value || 'default'}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={-1}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              <span className="custom-select-check" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
