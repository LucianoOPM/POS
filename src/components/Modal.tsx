import { ComponentChild } from "preact";
import { FC } from "preact/compat";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  header?: ComponentChild;
  body?: ComponentChild;
  footer?: ComponentChild;
  backdropClose?: boolean; // Permite cerrar haciendo click fuera del modal
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  header,
  body,
  footer,
  backdropClose = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: MouseEvent) => {
    if (backdropClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50 bg-opacity-40 select-none"
      onClick={handleBackdropClick}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700 flex flex-col">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <div>{header}</div>
            <button
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              aria-label="Cerrar modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="p-4 md:p-5 flex-1">{body}</div>
          {footer && (
            <div className="p-4 md:p-5 border-t border-gray-200 dark:border-gray-600 text-right rounded-b">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
