import React from "react";
import Layout from "../components/Layout";
    
const Post1 = () => (
<Layout>
  <div className="max-w-3xl mx-auto py-10 px-4 text-white space-y-8 leading-relaxed">
        <h1 className="pacity-90 max-w-2xl mb-8 text-4xl font-bold text-center text-[#00ff99]">
    title: "⚡ Kali Linux on VirtualBox",
      
    </h1>

    <p className=" text-center text-lg">
      Running Kali Linux inside VirtualBox gives you a full, isolated environment — safe, disposable, and flexible. Choose ISO for full control or OVA for quick setup.
    </p>

    {/* Immagine desktop Kali su VirtualBox */}
    <img
      src="https://www.kali.org/wallpapers/images/2024/kali-ferrofluid.jpg"
      alt="Kali Linux on VirtualBox screenshot"
      className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border border-[#00ff99]/50"
    />

    <h2 className="text-3xl font-bold text-[#00ff99] mt-6 text-center">📥 Option 1 — Install from ISO</h2>
    <p className="text-center">Installare Kali su VirtualBox da zero — massima personalizzazione:</p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Create a new VM: Type Linux → Debian (64‑bit)</li>
      <li>RAM: 2048MB min (4096MB recommended)</li>
      <li>Disk: VDI, dynamically allocated, 20‑30 GB</li>
      <li>Attach Kali ISO and start → choose <strong>Graphical Install</strong></li>
      <li>Configure language, keyboard, user/password</li>
      <li>Partition: guided → install GRUB → reboot</li>
      <li>Update system: <code>sudo apt update && sudo apt upgrade -y</code></li>
    </ol>

    {/* Immagine logo Kali */}
    <img
      src="https://images2.alphacoders.com/480/thumb-1920-480538.png"
      alt="Kali Linux logo"
      className="w-full max-w-sm mx-auto rounded-lg shadow-lg border border-[#00ff99]/50"
    />

    <h2 className="text-3xl font-bold text-[#00ff99] mt-6 text-center">🚀 Option 2 — Use Prebuilt OVA</h2>
    <p className="text-center">Per partire subito: importa la VM pre‑configurata su VirtualBox con pochi click.</p>
    <ul className="list-disc list-inside space-y-2">
      <li>Download OVA dal sito ufficiale di Kali.</li>
      <li>VirtualBox → File → Import Appliance → seleziona il file `.ova`</li>
      <li>Start VM, login con default credentials e un update rapido.</li>
    </ul>

    <h2 className="text-3xl font-bold text-[#00ff99] mt-6 text-center">🔧 Recommendations</h2>
    <ul className="list-disc list-inside space-y-1">
      <li>Video Memory: 128 MB+, abilita 3D se necessario</li>
      <li>Processors: 2+ cores (se l’host lo consente)</li>
      <li>Network: NAT per internet facile, Bridged per visibilità LAN</li>
      <li>Guest Additions (opzionale): migliorano clipboard condivisa e drag-drop</li>
    </ul>

    <p className="mt-8 font-semibold text-center text-lg">
      With this setup you’ll have a clean, isolated lab: ISO = control, OVA = speed. Test ethically, experiment freely.
    </p>
  </div>
</Layout>
);

export default Post1;
