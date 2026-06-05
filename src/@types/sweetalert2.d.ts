declare module 'sweetalert2' {
  interface SweetAlertOptions {
    title?: string;
    text?: string;
    html?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    [key: string]: any;
  }
  interface SweetAlertResult {
    isConfirmed: boolean;
    isDenied: boolean;
    isDismissed: boolean;
    value?: any;
  }
  function fire(options?: SweetAlertOptions): Promise<SweetAlertResult>;
  export { fire, SweetAlertOptions, SweetAlertResult };
  export default { fire };
}
