import { AppError, NotFoundError, UnprocessableError } from "@zadpay/errors";

export class MerchantNotFound extends NotFoundError {
  override readonly code = "CHECKOUT.MERCHANT_NOT_FOUND";
  constructor() {
    super("Merchant not found");
  }
}

export class CheckoutTransferFailed extends UnprocessableError {
  override readonly code = "CHECKOUT.TRANSFER_FAILED";
  constructor(reason: string) {
    super(`Checkout payment failed: ${reason}`);
  }
}

export class TotalMismatch extends AppError {
  readonly code = "CHECKOUT.TOTAL_MISMATCH";
  readonly httpStatus = 422;
  constructor() {
    super("Cart items don't add up to the declared total");
  }
}
