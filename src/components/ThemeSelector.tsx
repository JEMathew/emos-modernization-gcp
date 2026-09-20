import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type ThemeMode } from '../lib/theme';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: <Sun className="w-3.5 h-3.5" />,
      description: 'Clean enterprise light surface',
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: <Moon className="w-3.5 h-3.5" />,
      description: 'Preserved near-black enterprise dark',
    },
    {
      mode: 'system',
      label: 'System',
      icon: <Monitor className="w-3.5 h-3.5" />,
      description: 'Follow OS & browser preference',
    },
  ];

  const currentIcon = useMemoCurrentIcon(theme, resolvedTheme);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="theme-selector-button"
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-controls={isOpen ? 'theme-selector-dropdown' : undefined}
        aria-expanded={isOpen}
        aria-label={`Appearance: ${theme.charAt(0).toUpperCase() + theme.slice(1)}. Click to change.`}
        className="min-h-11 min-w-11 p-2 rounded-xl text-[var(--emos-text-muted)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)] border border-[var(--emos-border-subtle)] bg-[var(--emos-surface)] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--emos-accent)]"
        title={`Appearance: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
      >
        {currentIcon}
      </button>

      {isOpen && (
        <div
          id="theme-selector-dropdown"
          ref={menuRef}
          role="menu"
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsOpen(false); }}
          onKeyDown={event => {
            const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            let next: number | undefined;
            if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
            if (event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = buttons.length - 1;
            if (next !== undefined) { event.preventDefault(); buttons[next]?.focus(); }
          }}
          aria-orientation="vertical"
          aria-labelledby="theme-selector-button"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[var(--emos-surface)] border border-[var(--emos-border-strong)] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-[var(--emos-border-subtle)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emos-text-muted)]">
              Appearance
            </span>
          </div>

          <div className="py-1">
            {options.map((option) => {
              const isSelected = theme === option.mode;
              return (
                <button
                  key={option.mode}
                  id={`theme-option-${option.mode}`}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  type="button"
                  onClick={() => {
                    setTheme(option.mode);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`min-h-11 w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--emos-accent-subtle)] text-[var(--emos-accent-text)] font-semibold'
                      : 'text-[var(--emos-text-secondary)] hover:text-[var(--emos-text-primary)] hover:bg-[var(--emos-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? 'text-[var(--emos-accent)]' : 'text-[var(--emos-text-muted)]'}>
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--emos-accent)] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function useMemoCurrentIcon(theme: ThemeMode, resolvedTheme: 'light' | 'dark') {
  if (theme === 'system') {
    return <Monitor className="w-4 h-4 text-[var(--emos-accent)]" />;
  }
  if (theme === 'dark') {
    return <Moon className="w-4 h-4 text-[var(--emos-accent)]" />;
  }
  return <Sun className="w-4 h-4 text-[var(--emos-accent)]" />;
}
