export default class WebLN {
  static #isSupported: boolean | undefined;

  static get isSupported() {
    if (this.#isSupported === undefined) {
      this.#isSupported = window.webln !== undefined;
    }
    return this.#isSupported;
  }

  static async sendPayment(invoice: string) {
    if (!this.isSupported) {
      throw new Error("WebLN is not supported");
    }

    try {
      await window.webln.enable();

      return (await window.webln.sendPayment(invoice)) as {
        preimage: string;
      };
    } catch (error) {
      throw error;
    }
  }
}
