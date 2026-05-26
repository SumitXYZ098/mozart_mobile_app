declare module 'react-native-sweet-alert' {
  export interface SweetAlertOptions {
    title?: string;
    subTitle?: string;
    confirmButtonTitle?: string;
    confirmButtonColor?: string;
    otherButtonTitle?: string;
    otherButtonColor?: string;
    style?: 'success' | 'error' | 'warning' | 'default';
    cancellable?: boolean;
  }

  const SweetAlert: {
    /** Simple alert without callback */
    showAlert: (options: SweetAlertOptions) => void;
    /** Alert with a boolean callback indicating user confirmation */
    showAlertWithOptions: (
      options: SweetAlertOptions,
      callback: (isConfirmed: boolean) => void,
    ) => void;
  };

  export default SweetAlert;
}
