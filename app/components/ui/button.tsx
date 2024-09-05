import { ButtonHTMLAttributes, ReactNode } from 'react';

export const Button = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) => {
  return (
    <button {...props}>
      {children}
    </button>
  );
};