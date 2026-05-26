declare module 'react-native-sweet-alert' {
  interface SweetAlertStatic {
    showAlert(title: string, message: string, style?: string): void;
    // add other methods if needed
  }
  const SweetAlert: SweetAlertStatic;
  export default SweetAlert;
}
