// client/src/pages/Home.jsx
import { Link } from "react-router-dom";
import { 
  FaCode, FaPlay, FaLaptopCode, FaArrowRight, FaBug,
  FaUsers, FaHistory, FaDocker, FaTerminal, FaChartLine,
  FaGlobe, FaShareAlt, FaCloud, FaTrophy, FaMicrochip,
  FaMicrophone, FaChalkboardTeacher, FaGamepad,
  FaBrain, FaVrCardboard 
} from "react-icons/fa";
import { SiOpenai } from "react-icons/si";

const FeatureCard = ({ icon: Icon, title, description, bullets, color = "red", animate }) => (
  <div className="bg-[#EBE5C2] rounded-2xl p-8 group hover:transform hover:scale-105 
                 transition-all duration-300 shadow-lg border-b-4 border-[#8B8558]">
    <div className="flex items-start gap-6">
      <div className="bg-[#8B8558] p-4 rounded-xl shadow-md relative">
        <Icon className={`text-3xl text-white ${animate}`} />
        <div className={`absolute -top-2 -right-2 bg-${color}-400 w-4 h-4 rounded-full animate-pulse`}></div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-[#3B3B3B] font-['Poppins']">{title}</h3>
        <p className="text-[#5A5A5A] font-['Inter'] leading-relaxed">{description}</p>
        {bullets && (
          <ul className="text-sm text-[#5A5A5A] space-y-1 mt-2">
            {bullets.map((bullet, index) => (
              <li key={index}>• {bullet}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

const Home = () => {
  const advancedFeatures = [
    {
      icon: FaBug,
      title: "AI-Assisted Debugging",
      description: "Smart error detection and instant solutions",
      bullets: ["Intelligent error analysis", "Real-time fix suggestions", "Runtime error explanations"],
      color: "red",
      animate: "group-hover:animate-bounce"
    },
    {
      icon: FaUsers,
      title: "Live Collaboration",
      description: "Code together in real-time with team members",
      bullets: ["Real-time pair programming", "Built-in voice & chat", "Collaborative debugging"],
      color: "blue",
      animate: "group-hover:scale-110"
    },
    {
      icon: FaHistory,
      title: "Code Versioning",
      description: "Track and manage your code changes",
      bullets: ["Version history", "Visual diff viewer", "Instant rollback"],
      color: "green",
      animate: "group-hover:rotate-180 transition-transform duration-700"
    },
    {
      icon: FaDocker,
      title: "Custom Environments",
      description: "Configure your perfect development setup",
      bullets: ["Multiple runtime versions", "Custom library support", "Containerized execution"],
      color: "purple",
      animate: "group-hover:scale-110"
    },
    {
      icon: FaChartLine,
      title: "Execution Analytics",
      description: "Deep insights into code performance",
      bullets: ["Performance metrics", "Memory analysis", "Optimization tips"],
      color: "orange",
      animate: "group-hover:scale-110"
    },
    {
      icon: FaShareAlt,
      title: "Code Sharing",
      description: "Share and embed your code anywhere",
      bullets: ["Shareable links", "Embed support", "Access control"],
      color: "pink",
      animate: "group-hover:scale-110"
    },
  ];

  return (
    <div className="min-h-screen bg-[#EBE5C2] font-['Poppins']">
      {/* Hero Section */}
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between min-h-[80vh]">
          {/* Left Side Content */}
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-6xl font-bold text-[#3B3B3B] font-['Righteous'] leading-tight">
              Code. Execute.<br />
              <span className="text-[#5A5A5A]">Learn. Grow.</span>
            </h1>
            <p className="text-lg text-[#5A5A5A] font-['Inter'] max-w-md">
              Your one-stop platform for writing and executing code in multiple programming languages.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/editor" className="bg-[#8B8558] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#6B6343] transition-transform duration-200 hover:scale-105 shadow-md">
                Try Editor <FaArrowRight />
              </Link>
              <Link to="/register" className="border-2 border-[#8B8558] text-[#8B8558] px-6 py-3 rounded-lg hover:bg-[#8B8558] hover:text-white transition-colors duration-200 hover:scale-105 shadow-md">
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Right Side Code Example */}
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="bg-[#6B6343] p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#E6A4A4]"></div>
                <div className="w-3 h-3 rounded-full bg-[#E6D4A4]"></div>
                <div className="w-3 h-3 rounded-full bg-[#A4E6A4]"></div>
              </div>
              <pre className="text-[#EBE5C2] font-['Fira Code'] text-sm p-4 bg-[#5A5A5A] rounded-lg overflow-x-auto">
                <code>{`function welcomeToCodeBoost() {
  console.log("Hello, Developer!");
  console.log("Ready to code?");
}

// Start your coding journey
welcomeToCodeBoost();`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="bg-[#F5F2E3] py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#3B3B3B] text-center mb-4 font-['Righteous']">
            Advanced Development Features
          </h2>
          <p className="text-[#5A5A5A] text-center mb-12 font-['Inter'] max-w-2xl mx-auto">
            Professional-grade tools for modern development
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#8B8558]/20">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-[#5A5A5A] font-['Inter']">
            © 2025 CodeBoost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;