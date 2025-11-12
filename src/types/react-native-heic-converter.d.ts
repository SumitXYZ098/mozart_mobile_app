declare module "react-native-heic-converter" {
  interface HeicConvertResult {
    path?: string;
    success?: boolean;
    error?: string;
  }

  interface ConvertOptions {
    path: string; // input HEIC file path
    quality?: number; // between 0 and 1
    format?: string;
  }

  const RNHeicConverter: {
    convert(options: ConvertOptions): Promise<HeicConvertResult>;
  };

  export default RNHeicConverter;
}
