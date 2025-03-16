// client/src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FaCode,
  FaPlay,
  FaLaptopCode,
  FaArrowRight,
  FaBug,
  FaUsers,
  FaHistory,
  FaDocker,
  FaTerminal,
  FaChartLine,
  FaGlobe,
  FaShareAlt,
  FaCloud,
  FaTrophy,
  FaMicrochip,
  FaMicrophone,
  FaChalkboardTeacher,
  FaGamepad,
  FaBrain,
  FaVrCardboard,
} from "react-icons/fa";
import { SiOpenai } from "react-icons/si";

const FeatureCard = ({ feature, index, isVisible }) => {
  const iconRef = useRef(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      iconRef.current.classList.remove("hovered");
    }
  };

  const handleMouseLeave = () => {
    if (iconRef.current) {
      iconRef.current.classList.add("hovered");
    }
  };

  return (
    <div
      className={`feature-reveal ${isVisible ? "animate-feature" : ""} h-full`}
      style={{ "--feature-index": index }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-start gap-6 border-l-4 border-[#88BDBC] shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#88BDBC]/5 rounded-full"></div>

        <div
          ref={iconRef}
          className={`bg-[#88BDBC] p-4 rounded-xl shadow-md relative z-10 icon-container ${
            isVisible ? "animate-icon" : ""
          }`}
        >
          <feature.icon className="text-3xl text-white relative z-10" />
          <div
            className={`absolute -top-2 -right-2 bg-${feature.color}-400 w-4 h-4 rounded-full animate-pulse`}
          ></div>
        </div>

        <div className="space-y-3 relative z-10 flex-1">
          <h3
            className={`text-xl font-bold text-[#254E58] font-['Poppins'] feature-title ${
              isVisible ? "animate-title" : ""
            }`}
          >
            {feature.title}
          </h3>
          <p
            className={`text-[#112D32] font-['Inter'] leading-relaxed feature-description ${
              isVisible ? "animate-description" : ""
            }`}
          >
            {feature.description}
          </p>

          {feature.bullets && (
            <div className="flex flex-wrap gap-3 mt-4 feature-tags-container">
              {feature.bullets.map((bullet, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 bg-[#88BDBC]/10 px-3 py-1 rounded-full text-sm text-[#254E58] feature-tag ${
                    isVisible ? "animate-tag" : ""
                  }`}
                  style={{ "--tag-index": idx }}
                >
                  <span className="w-1.5 h-1.5 bg-[#88BDBC] rounded-full"></span>
                  {bullet}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CodeExample = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`bg-[#254E58] p-6 rounded-xl shadow-lg ${
        visible ? "slide-in-right" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-[#E6A4A4]"></div>
        <div className="w-3 h-3 rounded-full bg-[#E6D4A4]"></div>
        <div className="w-3 h-3 rounded-full bg-[#A4E6A4]"></div>
      </div>
      <pre className="text-white font-['Fira Code'] text-sm p-4 bg-[#112D32] rounded-lg overflow-x-auto relative">
        <div className="shimmer-effect absolute inset-0"></div>
        <code>{`function welcomeToCodeBoost() {
  console.log("Hello, Developer!");
  console.log("Ready to code?");
}

// Start your coding journey
welcomeToCodeBoost();`}</code>
      </pre>
    </div>
  );
};

const Home = () => {
  const featuresRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When features section enters viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Reset animation state when section is out of view for 1 second
          const timer = setTimeout(() => {
            if (!entry.isIntersecting) {
              setIsVisible(false);
            }
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          // Add a small delay before resetting to prevent flickering
          setTimeout(() => {
            setIsVisible(false);
          }, 300);
        }
      },
      { threshold: 0.2 } // Trigger when 20% of the section is visible
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  const advancedFeatures = [
    {
      icon: FaBug,
      title: "AI-Assisted Debugging",
      description: "Smart error detection and instant solutions",
      bullets: [
        "Intelligent error analysis",
        "Real-time fix suggestions",
        "Runtime error explanations",
      ],
      color: "red",
      animate: "group-hover:animate-bounce",
    },
    {
      icon: FaUsers,
      title: "Live Collaboration",
      description: "Code together in real-time with team members",
      bullets: [
        "Real-time pair programming",
        "Built-in voice & chat",
        "Collaborative debugging",
      ],
      color: "blue",
      animate: "group-hover:scale-110",
    },
    {
      icon: FaHistory,
      title: "Code Versioning",
      description: "Track and manage your code changes",
      bullets: ["Version history", "Visual diff viewer", "Instant rollback"],
      color: "green",
      animate: "group-hover:rotate-180 transition-transform duration-700",
    },
    {
      icon: FaChartLine,
      title: "Execution Analytics",
      description: "Deep insights into code performance",
      bullets: ["Performance metrics", "Memory analysis", "Optimization tips"],
      color: "orange",
      animate: "group-hover:scale-110",
    },
    {
      icon: FaShareAlt,
      title: "Code Sharing",
      description: "Share and embed your code anywhere",
      bullets: ["Shareable links", "Embed support", "Access control"],
      color: "pink",
      animate: "group-hover:scale-110",
    },
  ];

  return (
    <div className="min-h-screen bg-[#88BDBC] font-['Poppins']">
      {/* Hero Section */}
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between min-h-[80vh]">
          {/* Left Side Content */}
          <div className="md:w-1/2 space-y-6 slide-in-left">
            <h1 className="text-6xl font-bold text-white font-['Righteous'] leading-tight">
              Code. Execute.
              <br />
              <span className="text-white/80">Learn. Grow.</span>
            </h1>
            <p className="text-lg text-white/90 font-['Inter'] max-w-md fade-in-up delay-300">
              Your one-stop platform for writing and executing code in multiple
              programming languages.
            </p>
            <div className="flex gap-4 pt-4 fade-in-up delay-500">
              <Link
                to="/editor"
                className="bg-[#254E58] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#112D32] transition-transform duration-200 hover:scale-105 shadow-md pulse-animation"
              >
                Try Editor <FaArrowRight />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#88BDBC] transition-colors duration-200 hover:scale-105 shadow-md"
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Right Side Code Example */}
          <div className="md:w-1/2 mt-10 md:mt-0 float-animation">
            <CodeExample />
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div
        ref={featuresRef}
        className={`bg-white py-20 relative overflow-hidden ${
          isVisible ? "features-visible" : "features-hidden"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#88BDBC]/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-t from-[#88BDBC]/20 to-transparent"></div>
        <div className="absolute -left-20 top-40 w-40 h-40 rounded-full bg-[#88BDBC]/10 pulse-animation"></div>
        <div className="absolute -right-20 bottom-40 w-40 h-40 rounded-full bg-[#88BDBC]/10 pulse-animation"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 fade-in-up">
            {" "}
            <h2 className="text-5xl font-bold text-[#254E58] mb-4 font-['Righteous']">
              CodeBoost Essentials
            </h2>
            <div className="w-24 h-1 bg-[#88BDBC] mx-auto mb-6"></div>
            <p className="text-[#112D32] font-['Inter'] max-w-2xl mx-auto text-lg">
              Optimized for High-Performance Development
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            {/* First row - 2 features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <FeatureCard
                key={0}
                feature={advancedFeatures[0]}
                index={0}
                isVisible={isVisible}
              />
              <FeatureCard
                key={1}
                feature={advancedFeatures[1]}
                index={1}
                isVisible={isVisible}
              />
            </div>

            {/* Second row - 2 features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <FeatureCard
                key={2}
                feature={advancedFeatures[2]}
                index={2}
                isVisible={isVisible}
              />
              <FeatureCard
                key={3}
                feature={advancedFeatures[3]}
                index={3}
                isVisible={isVisible}
              />
            </div>

            {/* Third row - 1 feature */}
            <div className="max-w-2xl mx-auto w-full md:w-2/3">
              <FeatureCard
                key={4}
                feature={advancedFeatures[4]}
                index={4}
                isVisible={isVisible}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-white/80 font-['Inter']">
            © 2025 <span className="font-medium">CodeBoost</span>. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
