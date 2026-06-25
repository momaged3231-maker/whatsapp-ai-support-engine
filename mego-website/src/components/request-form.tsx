"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import {
  CUSTOMER_TYPES,
  SERVICE_PLACES,
  SERVICES,
  buildWhatsAppLink,
} from "@/lib/constants";

type Status = "idle" | "submitting" | "success" | "error";

export default function RequestForm({
  defaultService = "",
}: {
  defaultService?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [hasFiles, setHasFiles] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      customer_name: String(data.get("customer_name") || ""),
      phone: String(data.get("phone") || ""),
      customer_type: String(data.get("customer_type") || ""),
      service_type: String(data.get("service_type") || ""),
      service_place: String(data.get("service_place") || ""),
      area: String(data.get("area") || ""),
      description: String(data.get("description") || ""),
      preferred_time: String(data.get("preferred_time") || ""),
      has_attachments: hasFiles,
    };

    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // WhatsApp fallback still works even if saving fails.
    }

    const message = [
      "أهلاً ميجو، محتاج خدمة.",
      `الاسم: ${payload.customer_name}`,
      `رقم الهاتف: ${payload.phone}`,
      `نوع العميل: ${payload.customer_type}`,
      `نوع الخدمة: ${payload.service_type}`,
      `مكان الخدمة: ${payload.service_place}`,
      `العنوان: ${payload.area}`,
      `المشكلة: ${payload.description}`,
      payload.preferred_time ? `الوقت المناسب: ${payload.preferred_time}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(buildWhatsAppLink(message), "_blank");
    setStatus("success");
    form.reset();
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-mego-cyan/30 bg-mego-navy-light p-8 text-center">
        <p className="text-xl font-bold text-mego-cyan">
          تم استلام طلبك، هنراجع التفاصيل ونقولك السعر قبل التنفيذ.
        </p>
        <p className="mt-2 text-sm text-white/70">
          فتحنالك واتساب كمان عشان تأكد إرسال الطلب مباشرة.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full bg-mego-blue px-6 py-2 text-sm font-bold text-white"
        >
          إرسال طلب جديد
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-white/10 bg-mego-navy-light p-6 md:grid-cols-2 md:p-8"
    >
      <Field label="الاسم" required>
        <input
          name="customer_name"
          required
          placeholder="اسمك"
          className="input"
        />
      </Field>

      <Field label="رقم الهاتف" required>
        <input
          name="phone"
          type="tel"
          required
          placeholder="01xxxxxxxxx"
          className="input"
        />
      </Field>

      <Field label="نوع العميل" required>
        <select name="customer_type" required className="input" defaultValue="">
          <option value="" disabled>
            اختر نوع العميل
          </option>
          {CUSTOMER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="نوع الخدمة" required>
        <select
          name="service_type"
          required
          className="input"
          defaultValue={defaultService}
        >
          <option value="" disabled>
            اختر نوع الخدمة
          </option>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.title}>
              {s.title}
            </option>
          ))}
          <option value="خدمة أخرى">خدمة أخرى</option>
        </select>
      </Field>

      <Field label="مكان الخدمة" required>
        <select name="service_place" required className="input" defaultValue="">
          <option value="" disabled>
            اختر مكان الخدمة
          </option>
          {SERVICE_PLACES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="العنوان أو المنطقة داخل جمصة" required>
        <input
          name="area"
          required
          placeholder="مثال: جمصة، قرب مسجد السلام"
          className="input"
        />
      </Field>

      <Field label="وصف المشكلة أو الطلب" required full>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="اشرح المشكلة أو الطلب بالتفصيل"
          className="input resize-none"
        />
      </Field>

      <Field label="هل يوجد صور؟ (اختياري)">
        <input
          name="attachments"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setHasFiles((e.target.files?.length ?? 0) > 0)}
          className="block w-full text-sm text-white/70 file:ml-3 file:rounded-full file:border-0 file:bg-mego-blue file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
        />
      </Field>

      <Field label="الوقت المناسب للتواصل">
        <input
          name="preferred_time"
          placeholder="مثال: بعد الساعة 5 العصر"
          className="input"
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="md:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-full bg-mego-blue py-4 text-lg font-extrabold text-white shadow-lg shadow-mego-blue/30 transition hover:bg-mego-cyan disabled:opacity-60"
      >
        {status === "submitting" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        ابعت الطلب على واتساب
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-bold text-white">
        {label}
        {required && <span className="text-mego-yellow"> *</span>}
      </span>
      {children}
    </label>
  );
}
