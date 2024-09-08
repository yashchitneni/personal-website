declare module '@clerk/nextjs/server' {
  export const auth: () => {
    userId: string | null;
    // Add other properties as needed
  };
}

declare module '@clerk/nextjs' {
  export const useAuth: () => {
    isLoaded: boolean;
    userId: string | null;
    sessionId: string | null;
    // Add other properties as needed
  };
}