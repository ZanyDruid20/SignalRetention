import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FeatureCardProps = {
    title: string;
    description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
    return (
        <Card
            className="
            transition-all
            duration-300
            hover:-translate-y-2
            hover:shadow-lg
        "
        >
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{description}</p>
            </CardContent>
        </Card>
    )
}