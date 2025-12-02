const Post1 = () => (
  <div className="space-y-6 text-white">
    <p>
      Kali Linux is a powerful penetration testing and ethical hacking distribution. 
      Running it inside a VirtualBox VM ensures your host system stays safe and isolated.
    </p>

    {/* Image 1 */}
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/9/9f/Kali_Linux_2020.png" 
      alt="Kali Linux logo" 
      className="w-full rounded-lg shadow-2xl border border-[#00ff99]/50" 
    />

    <h2 className="text-2xl font-bold text-[#00ff99] mt-4">📥 Option 1 — Install from ISO</h2>
    <p>
      Installing Kali from the ISO gives you full control over the system. Follow these steps:
    </p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Open VirtualBox → click "New" → Name: <code>Kali Linux</code> → Type: Linux → Version: Debian (64-bit)</li>
      <li>Allocate RAM: 2048MB minimum (better 4096MB+)</li>
      <li>Create a virtual hard disk: VDI, dynamically allocated, 20–30GB</li>
      <li>Start VM and attach the Kali ISO</li>
      <li>Select <strong>Graphical Install</strong> and configure language, keyboard, and user</li>
      <li>Partitioning: Guided – Use Entire Disk → Install GRUB → Reboot</li>
    </ol>

    {/* Image 2 */}
    <img 
      src="https://www.kali.org/images/kali-virtualbox-vm.png" 
      alt="Kali VirtualBox setup" 
      className="w-full rounded-lg shadow-2xl border border-[#00ff99]/50" 
    />

    <h2 className="text-2xl font-bold text-[#00ff99] mt-4">🚀 Option 2 — Preconfigured OVA</h2>
    <p>
      If you want to get started fast, download the official VirtualBox OVA and import it:
    </p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Download the OVA from the official Kali Linux site</li>
      <li>VirtualBox → File → Import Appliance → select the OVA → Import</li>
      <li>Login with default credentials and update the system</li>
    </ol>

    <h2 className="text-2xl font-bold text-[#00ff99] mt-4">🔧 Tips & Tweaks</h2>
    <ul className="list-disc list-inside space-y-2">
      <li>Enable 3D acceleration and 128MB video memory for better performance</li>
      <li>Use 2+ CPU cores if your host allows</li>
      <li>Enable NAT or Bridged networking depending on your needs</li>
      <li>Install VirtualBox Guest Additions for clipboard sharing and drag’n’drop</li>
    </ul>

    <h2 className="text-2xl font-bold text-[#00ff99] mt-4">✅ Ready to go</h2>
    <p>
      Your Kali lab is now isolated, safe, and ready for ethical hacking experiments. ISO = full control, OVA = speed.
    </p>
  </div>
);

export default Post1;

