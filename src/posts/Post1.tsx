// src/posts/Post1.tsx
const Post1 = () => (
  <div className="space-y-6">
    <p>
      Keep your host clean and your Kali Linux contained. ISO = full control, OVA = speed.
    </p>

    <img
      src="https://raw.githubusercontent.com/USERNAME/REPO/main/images/kali-virtualbox.png"
      alt="Kali Linux on VirtualBox"
      className="w-full rounded-lg shadow-lg"
    />

    <h2 className="text-2xl font-bold text-[#00ff99]">Prerequisites 🧰</h2>
    <ul className="list-disc list-inside">
      <li>VirtualBox → official download</li>
      <li>Kali Linux ISO → for full control</li>
      <li>Kali OVA → preconfigured, fast setup</li>
      <li>RAM: 4GB minimum (8GB+ recommended)</li>
      <li>Disk: 20–30GB</li>
    </ul>

    <h2 className="text-2xl font-bold text-[#00ff99]">Installation Option 1 — ISO</h2>
    <p>For full manual control of the VM:</p>
    <ol className="list-decimal list-inside space-y-1">
      <li>Create a new VM in VirtualBox: Type Linux → Debian 64-bit</li>
      <li>Assign RAM and create a dynamically allocated VDI disk</li>
      <li>Attach the Kali ISO and boot → Graphical Install</li>
      <li>Set language, keyboard, user, password</li>
      <li>Guided partition → install GRUB → reboot</li>
      <li>Update system: <code>sudo apt update && sudo apt upgrade -y</code></li>
    </ol>

    <h2 className="text-2xl font-bold text-[#00ff99]">Installation Option 2 — OVA</h2>
    <p>Quick setup with preconfigured VM:</p>
    <ol className="list-decimal list-inside space-y-1">
      <li>Download the official OVA for VirtualBox</li>
      <li>Import in VirtualBox → File → Import Appliance</li>
      <li>Start VM → login with default credentials</li>
      <li>Update system: <code>sudo apt update && sudo apt upgrade -y</code></li>
    </ol>

    <h2 className="text-2xl font-bold text-[#00ff99]">Performance Tweaks 🔧</h2>
    <ul className="list-disc list-inside">
      <li>Video Memory: 128MB+, enable 3D acceleration if needed</li>
      <li>Processors: 2+ cores if host supports</li>
      <li>Network: NAT or Bridged</li>
      <li>Enable Shared Clipboard + Drag’n’Drop</li>
      <li>Optional: install Guest Additions for better integration</li>
    </ul>

    <h2 className="text-2xl font-bold text-[#00ff99]">Post-install Essentials 🛡️</h2>
    <ul className="list-disc list-inside">
      <li>Install extended Kali tools: <code>sudo apt install -y kali-linux-large</code></li>
      <li>Create a clean snapshot</li>
      <li>Keep networks isolated, always test ethically</li>
    </ul>

    <p className="font-semibold">
      Your Kali lab is ready! ISO = full control, OVA = speed. Stay safe, test ethically.
    </p>
  </div>
);

export default Post1;
