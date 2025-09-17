import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-combo-box',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="combo-box" [class.open]="isOpen()">
      <div class="combo-input-container">
        <input
          #inputElement
          type="text"
          class="combo-input"
          [value]="selectedValue()"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          [placeholder]="placeholder()"
          autocomplete="off"
        />
        <button
          class="combo-toggle"
          type="button"
          (click)="toggleDropdown()"
          (mousedown)="$event.preventDefault()"
          (blur)="onToggleBlur()"
        >
          <svg width="12" height="8" viewBox="0 0 12 8">
            <path d="M6 8L0 0h12z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      @if (isOpen() && filteredOptions().length > 0) {
        <ul class="combo-dropdown" role="listbox">
          @for (option of filteredOptions(); track option; let i = $index) {
            <li
              class="combo-option"
              [class.highlighted]="highlightedIndex() === i"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex.set(i)"
              role="option"
              [attr.aria-selected]="selectedValue() === option"
            >
              {{ option }}
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './combo-box.component.scss'
})
export class ComboBoxComponent {
  // Inputs
  options = input.required<readonly string[]>();
  value = input<string>('');
  placeholder = input<string>('Select or type...');

  // Outputs
  valueChange = output<string>();

  // View children
  inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  // State
  protected isOpen = signal(false);
  protected selectedValue = signal('');
  protected inputValue = signal('');
  protected highlightedIndex = signal(-1);
  protected showAllOptions = signal(false);

  // Computed
  protected filteredOptions = computed(() => {
    // Always show all options when showAllOptions is true (when dropdown button is clicked)
    if (this.showAllOptions()) {
      return this.options();
    }

    const input = this.inputValue().toLowerCase().trim();

    // If no input or input matches the selected value exactly, show all options
    if (!input || input === this.selectedValue().toLowerCase()) {
      return this.options();
    }

    // Filter options based on input
    return this.options().filter(option =>
      option.toLowerCase().includes(input)
    );
  });

  constructor() {
    // Sync external value changes
    effect(() => {
      const externalValue = this.value();
      this.selectedValue.set(externalValue);
      this.inputValue.set(externalValue);
    });
  }

  protected onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.inputValue.set(value);
    this.selectedValue.set(value);
    this.isOpen.set(true);
    this.showAllOptions.set(false); // Disable show all when typing
    this.highlightedIndex.set(-1);

    this.valueChange.emit(value);
  }

  protected onFocus(): void {
    // Only open and filter when user directly clicks/focuses input
    // Don't interfere if dropdown is already open via toggle button
    if (!this.isOpen()) {
      this.isOpen.set(true);
      this.showAllOptions.set(false);
    }
    this.highlightedIndex.set(-1);
  }

  protected onBlur(): void {
    // Delay closing to allow option clicks to register
    setTimeout(() => {
      this.isOpen.set(false);
      this.showAllOptions.set(false);
      this.highlightedIndex.set(-1);
    }, 150);
  }

  protected onToggleBlur(): void {
    // Delay closing to allow option clicks to register
    setTimeout(() => {
      this.isOpen.set(false);
      this.showAllOptions.set(false);
      this.highlightedIndex.set(-1);
    }, 150);
  }

  protected toggleDropdown(): void {
    const wasOpen = this.isOpen();

    if (wasOpen) {
      // Close the dropdown
      this.isOpen.set(false);
      this.showAllOptions.set(false);
    } else {
      // Open the dropdown and show all options
      this.isOpen.set(true);
      this.showAllOptions.set(true);
      this.highlightedIndex.set(-1);
      // Don't auto-focus the input - this was causing the issue
    }
  }

  protected selectOption(option: string): void {
    this.selectedValue.set(option);
    this.inputValue.set(option);
    this.isOpen.set(false);
    this.showAllOptions.set(false);
    this.highlightedIndex.set(-1);

    this.valueChange.emit(option);
    this.inputElement().nativeElement.focus();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const filteredOpts = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.isOpen.set(true);
          this.showAllOptions.set(true); // Show all options when opening via keyboard
        }
        this.highlightedIndex.update(index =>
          index < filteredOpts.length - 1 ? index + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.isOpen.set(true);
          this.showAllOptions.set(true); // Show all options when opening via keyboard
        }
        this.highlightedIndex.update(index =>
          index > 0 ? index - 1 : filteredOpts.length - 1
        );
        break;

      case 'Enter':
        event.preventDefault();
        const highlightedIdx = this.highlightedIndex();
        if (this.isOpen() && highlightedIdx >= 0 && filteredOpts[highlightedIdx]) {
          this.selectOption(filteredOpts[highlightedIdx]);
        } else {
          // User pressed enter with custom text
          this.isOpen.set(false);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        this.showAllOptions.set(false);
        this.highlightedIndex.set(-1);
        break;
    }
  }
}
