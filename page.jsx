import dynamic from "next/dynamic";

const StoryboardRoot = dynamic(() => import("./StoryboardRoot"), { ssr: false });

export default function Page() {
  return <StoryboardRoot />;
}
