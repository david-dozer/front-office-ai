export {};

declare global {
  interface Window {
    $: any;
    jQuery: any;
    Chart: any; // Add Chart to the global window object
  }
}
