import { Card } from "@/components/ui/card";
import { Award, Users, TrendingUp, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Award,
      title: "Quality Products",
      description: "We curate only the finest electronics from trusted brands worldwide",
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Your satisfaction is our priority with 24/7 dedicated support",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Bringing you the latest technology and cutting-edge products",
    },
    {
      icon: Heart,
      title: "Trust & Reliability",
      description: "Building lasting relationships through honest service",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground text-center">
            About Electronixz
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            Your trusted destination for premium electronics and innovative technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="text-lg leading-relaxed text-foreground">
              At Electronixz, we're committed to bringing you the latest and greatest in consumer electronics. 
              Our mission is to make cutting-edge technology accessible to everyone, while providing exceptional 
              customer service and competitive prices.
            </p>
            <p className="text-lg leading-relaxed text-foreground">
              Founded with a passion for innovation, we've grown to become a trusted name in electronics retail. 
              We carefully select each product in our catalog, ensuring it meets our high standards for quality, 
              performance, and value.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-lg text-foreground">
                  <strong className="font-semibold">Authentic Products:</strong> 100% genuine electronics from authorized distributors
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-lg text-foreground">
                  <strong className="font-semibold">Best Prices:</strong> Competitive pricing without compromising quality
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-lg text-foreground">
                  <strong className="font-semibold">Fast Shipping:</strong> Free delivery on all orders nationwide
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-lg text-foreground">
                  <strong className="font-semibold">Easy Returns:</strong> 30-day hassle-free return policy
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-6 text-center hover-elevate transition-all border-card-border">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="p-12 bg-muted border-card-border">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Join Our Journey</h2>
            <p className="text-lg leading-relaxed text-foreground mb-8">
              We're constantly evolving and expanding our product lineup to bring you the best technology 
              has to offer. Thank you for choosing Electronixz as your electronics partner. Together, 
              we're shaping the future of smart living.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">10K+</p>
                <p className="text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">500+</p>
                <p className="text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">99%</p>
                <p className="text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
