import BaseComponent from "@/components/base/base-component";

interface IAuthFieldAttributes {
  minLength: number;
  maxLength: number;
  regex?: RegExp;
  errorText?: string;
}

export function renderAuthField(parameters: {
  parent: BaseComponent<HTMLElement>;
  classNames: { div?: string; label?: string; input?: string; error?: string };
  id: string;
  type: string;
  labelText: string;
  placeholderText: string;
  validationAttributes: IAuthFieldAttributes;
}): {
  input: BaseComponent<HTMLInputElement>;
  error: BaseComponent<HTMLElement>;
} {
  const inputWrapper = new BaseComponent<HTMLElement>({
    tag: "div",
    className: parameters.classNames.div,
    parent: parameters.parent,
  });

  createLabel(
    inputWrapper,
    parameters.id,
    parameters.labelText,
    parameters.classNames.label,
  );

  const inputComponent = createInput(
    inputWrapper,
    parameters.id,
    parameters.type,
    parameters.placeholderText,
    parameters.validationAttributes,
    parameters.classNames.input,
  );

  const errorComponent = createError(inputWrapper, parameters.classNames.error);

  return {
    input: inputComponent,
    error: errorComponent,
  };
}

function createLabel(
  parent: BaseComponent,
  forId: string,
  text: string,
  className?: string,
): void {
  new BaseComponent({
    tag: "label",
    className,
    parent,
    text,
    attributes: { for: forId },
  });
}

function createInput(
  parent: BaseComponent,
  id: string,
  type: string,
  placeholder: string,
  attributes: IAuthFieldAttributes,
  className?: string,
): BaseComponent<HTMLInputElement> {
  return new BaseComponent<HTMLInputElement>({
    tag: "input",
    className,
    id: id,
    parent,
    attributes: {
      type,
      placeholder,
      required: "",
      name: id,
      minlength: String(attributes.minLength),
      maxLength: String(attributes.maxLength),
      "data-error-text": attributes.errorText || "",
    },
  });
}

function createError(
  parent: BaseComponent,
  className?: string,
): BaseComponent<HTMLSpanElement> {
  return new BaseComponent<HTMLSpanElement>({
    tag: "span",
    className,
    parent: parent,
    text: "",
  });
}
