import Link from "next/link";
import { Lightbulb, Network, Link2, FolderTree } from "lucide-react";

const menuItems = [
  { name: "概览", icon: Lightbulb, href: "/knowledge/ontology" },
  { name: "类层次", icon: FolderTree, href: "/knowledge/ontology/classes" },
  { name: "关系", icon: Link2, href: "/knowledge/ontology/relations" },
  { name: "实例", icon: Network, href: "/knowledge/ontology/instances" },
];

export function Sidebar() {
  return (
    <div className="w-60 bg-gray-900 text-white p-4 space-y-6">
      <h2 className="text-xl font-bold">Ontology</h2>
      <nav>
        <ul className="space-y-4">
          {menuItems.map(({ name, icon: Icon, href }) => (
            <li key={name}>
              <Link href={href} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}