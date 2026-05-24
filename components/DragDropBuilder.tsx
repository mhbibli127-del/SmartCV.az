"use client";

import type { ReactNode } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

type CVExperience = {
  title: string;
  company: string;
  description: string;
};

type CVEducation = {
  degree: string;
  university: string;
};

type CVData = {
  name: string;
  email: string;
  skills: string[];
  experience: CVExperience[];
  education: CVEducation[];
};

type DragDropBuilderProps = {
  order?: string[];
  onOrderChange?: (nextOrder: string[]) => void;
  cvData?: CVData;
};

const cards = [
  { id: "personal", title: "Personal Info", description: "Name, email, and profile overview." },
  { id: "skills", title: "Skills", description: "Your top strengths and achievements." },
  { id: "experience", title: "Experience", description: "Career history and impact statements." },
  { id: "education", title: "Education", description: "Degrees and certifications." },
];

function SortableCard({ id, title, description, content }: { id: string; title: string; description: string; content: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/10"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.35em] text-slate-300 transition hover:bg-slate-800"
        >
          Drag
        </button>
      </div>
      <div className="rounded-3xl bg-slate-950/90 p-4 text-sm text-slate-200">{content}</div>
    </motion.div>
  );
}

export default function DragDropBuilder({ order = ["personal", "skills", "experience", "education"], onOrderChange = () => {}, cvData }: DragDropBuilderProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id && onOrderChange) {
      const oldIndex = order!.indexOf(active.id as string);
      const newIndex = order!.indexOf(over.id as string);
      onOrderChange(arrayMove(order!, oldIndex, newIndex));
    }
  };

  const sectionContent = {
    personal: (
      <div>
        <p className="text-sm text-slate-300"><span className="font-semibold text-slate-50">Name:</span> {cvData?.name || 'Not provided'}</p>
        <p className="text-sm text-slate-300"><span className="font-semibold text-slate-50">Email:</span> {cvData?.email || 'Not provided'}</p>
      </div>
    ),
    skills: (
      <div className="flex flex-wrap gap-2">
        {cvData?.skills?.map((skill) => (
          <span key={skill} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
            {skill}
          </span>
        )) || <p className="text-sm text-slate-400">No skills added</p>}
      </div>
    ),
    experience: (
      <div className="space-y-3">
        {cvData?.experience?.map((item) => (
          <div key={`${item.title}-${item.company}`}>
            <p className="text-sm font-semibold text-slate-50">{item.title}</p>
            <p className="text-xs text-slate-400">{item.company}</p>
          </div>
        )) || <p className="text-sm text-slate-400">No experience added</p>}
      </div>
    ),
    education: (
      <div className="space-y-3">
        {cvData?.education?.map((item) => (
          <div key={`${item.degree}-${item.university}`}>
            <p className="text-sm font-semibold text-slate-50">{item.degree}</p>
            <p className="text-xs text-slate-400">{item.university}</p>
          </div>
        )) || <p className="text-sm text-slate-400">No education added</p>}
      </div>
    ),
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Drag & Drop Builder</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Arrange your resume flow</h2>
        </div>
        <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-100 ring-1 ring-blue-500/20">Smooth reorder</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order!} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {order!.map((id) => {
              const card = cards.find((item) => item.id === id);
              return card ? (
                <SortableCard key={id} id={id} title={card.title} description={card.description} content={sectionContent[id as keyof typeof sectionContent]} />
              ) : null;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
