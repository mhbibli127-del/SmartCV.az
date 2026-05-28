import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default function EditorByIdPage({ params }: PageProps) {
  redirect(`/dashboard/studio?id=${encodeURIComponent(params.id)}`);
}
