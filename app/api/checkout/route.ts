import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { CheckoutError, createCheckout } from "@/lib/orders";

const FIELD_MAP: Record<string, string> = {
  "customer.name": "name", "customer.email": "email", "customer.phone": "phone", "customer.cpf": "cpf",
  "address.cep": "cep", "address.street": "street", "address.number": "number",
  "address.district": "district", "address.city": "city", "address.state": "state",
};

export async function POST(req: Request) {
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    const errors: string[] = [];
    for (const issue of parsed.error.issues) {
      const key = FIELD_MAP[issue.path.join(".")];
      if (key) fieldErrors[key] ??= issue.message;
      else errors.push(issue.message);
    }
    if (Object.keys(fieldErrors).length) errors.unshift("Confira os campos destacados.");
    return NextResponse.json({ fieldErrors, errors: [...new Set(errors)] }, { status: 400 });
  }
  try {
    return NextResponse.json(await createCheckout(parsed.data));
  } catch (err) {
    if (err instanceof CheckoutError) return NextResponse.json({ errors: err.messages }, { status: 400 });
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente." }, { status: 500 });
  }
}
