import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedPhones } from '@/components/home/FeaturedPhones';
import { TrustBadges } from '@/components/home/TrustBadges';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      <FeaturedPhones />
      <TrustBadges />
    </Layout>
  );
};

export default Index;
