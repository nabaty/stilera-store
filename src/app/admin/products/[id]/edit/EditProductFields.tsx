
"use client";

type Props = {
  defaultCategory: string;
  defaultIsActive: boolean;
  defaultIsNewArrival: boolean;
};

const fieldClass =
  "w-full border border-white/20 bg-black px-4 py-3 text-white";

export default function EditProductFields({
  defaultCategory,
  defaultIsActive,
  defaultIsNewArrival,
}: Props) {
  return (
    <>
      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm"
        >
          Kategori *
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultCategory}
          className={fieldClass}
        >
          <option value="t-shirts">T-Shirts</option>
          <option value="tops">Tops</option>
          <option value="bottoms">Bottoms</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaultIsActive}
          className="accent-red-600"
        />
        Aktifkan produk
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="is_new_arrival"
          defaultChecked={defaultIsNewArrival}
          className="accent-red-600"
        />
        Tandai sebagai New Arrival
      </label>
    </>
  );
}
