import React from 'react'; // {{ edit_1 }}

/**
 * Custom input component.
 * @function Input
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props - The input element props.
 * @returns {JSX.Element} The rendered input element.
 */
export function Input({ ...props }) {
  return <input {...props} className="input" />
}