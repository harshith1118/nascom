import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, ShieldCheck, FileUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Add performance optimizations
export const dynamic = 'force-dynamic';
// export const revalidate = 0; // Removed due to error

const features = [
  {
    icon: Bot,
    title: "Generate Test Cases",
    description: "Convert requirements into comprehensive test cases using AI.",
    link: "/generate",
    cta: "Start Generating",
  },
  {
    icon: ShieldCheck,
    title: "Check for Compliance",
    description: "Analyze test cases against healthcare standards like FDA and ISO.",
    link: "/compliance",
    cta: "Check Compliance",
  },
  {
    icon: FileUp,
    title: "Import Existing Tests",
    description: "Migrate and manage your existing test suites in one place.",
    link: "/import",
    cta: "Import Now",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to MediTestAI</h1>
                <p className="text-muted-foreground mb-6">Your AI-powered partner for automating healthcare software testing. Streamline your QA process, ensure compliance, and accelerate your time-to-market with intelligent test case generation.</p>
                <div className="flex gap-4">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/generate">Generate New Tests <ArrowRight className="ml-2 h-5 w-5"/></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/manage">View Test Cases</Link>
                    </Button>
                </div>
            </div>
            <div className="relative h-64 md:h-full">
                <Image
                    src="/louis-reed-pwcKF7L4-no-unsplash.jpg"
                    alt="AI in Healthcare"
                    fill
                    className="object-cover"
                    data-ai-hint="healthcare technology"
                    priority={true}
                />
            </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 pb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <CardDescription className="flex-grow">{feature.description}</CardDescription>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href={feature.link}>{feature.cta} <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
