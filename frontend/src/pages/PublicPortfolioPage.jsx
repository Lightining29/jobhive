import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioService } from '../services';
import { renderPortfolioTheme } from '../components/portfolio/ThemeRegistry';
import { PageLoader } from '../components/ui/States';
import SEOHead from '../components/seo/SEOHead';
import { FaArrowLeft, FaWandMagicSparkles } from 'react-icons/fa6';

export const PublicPortfolioPage = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await portfolioService.getPublic(slug);
        setPortfolio(res.data.portfolio);
      } catch (err) {
        setError(err.response?.data?.message || 'Portfolio not found or currently private.');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <PageLoader />;

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-[28px] bg-[#070e24] border-2 border-cyan-500/40 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
            <FaWandMagicSparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black mb-2">Portfolio Unavailable</h1>
          <p className="text-sm text-slate-400 mb-6">{error || 'The requested portfolio could not be found.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all">
            <FaArrowLeft className="h-3 w-3" /> Return to Job Workplace
          </Link>
        </div>
      </div>
    );
  }

  const metaTitle = portfolio.seo?.title || `${portfolio.hero?.name || 'Developer'} | ${portfolio.hero?.title || 'Professional'} Portfolio`;
  const metaDesc = portfolio.seo?.metaDescription || portfolio.hero?.tagline || `Explore the verified professional portfolio, projects, and skills of ${portfolio.hero?.name}.`;

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDesc}
        keywords={portfolio.seo?.keywords || [portfolio.hero?.name, portfolio.hero?.title]}
        canonicalUrl={`/portfolio/${portfolio.slug}`}
      />

      {renderPortfolioTheme(portfolio.theme, portfolio)}
    </>
  );
};

export default PublicPortfolioPage;
