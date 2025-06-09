import { FC } from "preact/compat";

interface ErrorMessageProps {
  error?: { message?: string };
}
export const ErrorMessage: FC<ErrorMessageProps> = ({ error }) => {
  return error ? (
    <p class="mt-2 text-sm text-red-600 dark:text-red-500">
      <span className="font-medium">
        {error.message || "Este campo es requerido"}
      </span>
    </p>
  ) : null;
};
