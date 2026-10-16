import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import HeroScroll from '../components/home/HeroScroll';
import CapabilityWall from '../components/home/CapabilityWall';
import ScrollStory from '../components/home/ScrollStory';
import FeatureTabs from '../components/home/FeatureTabs';
import RoleTabs from '../components/home/RoleTabs';
import QuickStartGrid from '../components/home/QuickStartGrid';
import { ClosingCTA } from '../components/marketing/Sections';

const Homepage = () => {
  const navigate = useNavigate();

  // Signed-in users go straight to their dashboard.
  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);

  return (
    <div className="bg-canvas">
      <HeroScroll />
      <CapabilityWall />
      <ScrollStory />
      <FeatureTabs />
      <RoleTabs />
      <QuickStartGrid />
      <ClosingCTA lead="Set up your company, bring in your team, and let swaps run through one clear, approved process." />
    </div>
  );
};

export default Homepage;
