import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const ImageUploader = ({ onUpload }) => {
  const { isDark } = useTheme();

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-10 rounded-2xl cursor-pointer transition-all duration-300 group 
        ${
          isDark
            ? "border-gray-600 bg-gray-800 hover:bg-gray-700"
            : "border-gray-300 bg-white hover:bg-gray-100"
        }
        ${isDragActive && "shadow-xl scale-[1.02]"}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 
            ${
              isDragActive
                ? "bg-blue-600 text-white scale-110 shadow-lg"
                : isDark
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }
          `}
        >
          <FiUploadCloud className="w-10 h-10" />
        </div>

        {/* Text */}
        {isDragActive ? (
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Drop your image here…
          </p>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
              Drag & drop an image here
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              or click to select from device
            </p>
          </>
        )}

        <div
          className={`flex items-center gap-2 text-sm mt-2 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <FiImage />
          <span>JPG, JPEG, PNG supported</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
