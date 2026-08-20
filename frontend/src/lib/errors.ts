export const errorMessage = (error: unknown) => {
  const anyError = error as any;
  return (
    anyError?.shortMessage ||
    anyError?.reason ||
    anyError?.response?.data?.error ||
    anyError?.message ||
    'Đã có lỗi xảy ra'
  );
};
