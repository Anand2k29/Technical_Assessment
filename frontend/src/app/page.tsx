"use client";

import Link from "next/link";
import { useUserId } from "@/lib/session";

export default function Landing() {
  const hasSession = Boolean(useUserId());

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center flex-1 flex flex-col items-center justify-center">
        <span className="inline-block text-xs font-semibold tracking-wide text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 mb-6">
          AI TEACHER · NOT A CHATBOT
        </span>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-5">
          AUTO<span className="text-indigo-600">PSY</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mb-10">
          Understands your material. Plans a lesson for you. Teaches it out loud. Asks you questions,
          catches your misconceptions, and adapts — until you actually get it.
        </p>
        <div className="flex gap-3">
          <Link href={hasSession ? "/dashboard" : "/onboarding"} className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            {hasSession ? "Go to Dashboard" : "Start Learning"}
          </Link>
          <Link href="/onboarding" className="px-6 py-3 rounded-full border border-slate-300 font-semibold text-slate-700 hover:bg-white">
            Try the demo lesson
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-20 text-left">
          {[
            ["Understand", "Reads your uploaded material or a topic and grounds every explanation in it."],
            ["Teach", "A narrated AI teacher with visuals — equations, diagrams, timelines, code — not a wall of text."],
            ["Detect", "Notices *why* you got something wrong, not just that you did."],
            ["Adapt", "Re-teaches with a different strategy, raises difficulty as mastery grows, and reports what to study next."],
          ].map(([title, body]) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="font-semibold text-slate-900 mb-1">{title}</div>
              <div className="text-sm text-slate-500">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
