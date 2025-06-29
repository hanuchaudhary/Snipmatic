import Image from "next/image"

export function Testimonial({
  quote,
  name,
  title,
  avatar,
}: {
  quote: string
  name: string
  title: string
  avatar: string
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 flex flex-col">
      <div className="flex-grow">
        <div className="text-3xl text-indigo-300 mb-4">"</div>
        <p className="text-neutral-700 mb-6">{quote}</p>
      </div>
      <div className="flex items-center">
        <Image src={avatar || "/placeholder.svg"} alt={name} width={50} height={50} className="rounded-full mr-4" />
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-neutral-500 text-sm">{title}</p>
        </div>
      </div>
    </div>
  )
}

