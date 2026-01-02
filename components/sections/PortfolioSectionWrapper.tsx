import { calculatePortfolioMetrics, getRentalPropertiesWithPayments } from '@/lib/portfolio-calculations'
import PortfolioSection from './PortfolioSection'

export default async function PortfolioSectionWrapper() {
  const portfolioMetrics = await calculatePortfolioMetrics()
  const properties = await getRentalPropertiesWithPayments()

  return <PortfolioSection portfolioMetrics={portfolioMetrics} properties={properties} />
}

