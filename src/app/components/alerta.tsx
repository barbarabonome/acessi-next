import React from "react";

type AlertType = "success" | "error";

interface AlertMessageProps {
  type: AlertType;
  message: string;
  onClose: () => void;
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  const baseStyles =
    "fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg flex items-center justify-between gap-4 z-50 max-w-[90%] w-auto text-sm";

  const typeStyles: Record<AlertType, string> = {
    success: "bg-green-100 text-green-800 border border-green-300",
    error: "bg-red-100 text-red-800 border border-red-300",
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="font-bold text-lg px-2">&times;</button>
    </div>
  );
}
