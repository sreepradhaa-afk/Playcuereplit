import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function Feedback() {
  useSEO({
    title: "Feedback & Suggestions | PlayCue Party Games",
    description: "Share your feedback, report bugs, or suggest new games for PlayCue. We'd love to hear from you! Help us make the best party game platform for families and friends.",
    keywords: "feedback, contact, bug report, feature request, game suggestions, customer support",
  });

  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "",
      message: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    console.log("Feedback submitted:", data);
    
    toast({
      title: "Feedback Received!",
      description: "Thank you for your feedback. We'll review it and get back to you soon.",
    });

    setIsSubmitted(true);
    form.reset();

    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-orange-500/20">
              <MessageSquare className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent">
            We'd Love Your Feedback
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us make PlayCue even better! Share your thoughts, report bugs, or suggest new games.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8">
            {isSubmitted ? (
              <div className="text-center space-y-4 py-12">
                <div className="flex justify-center">
                  <div className="p-6 rounded-full bg-green-500/20">
                    <Send className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-display font-semibold">Thank You!</h2>
                <p className="text-muted-foreground">
                  Your feedback has been submitted successfully.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              {...field}
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="game-suggestion">Game Suggestion</SelectItem>
                            <SelectItem value="general">General Feedback</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us what's on your mind..."
                            className="min-h-32 resize-none"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-submit"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {form.formState.isSubmitting ? "Sending..." : "Send Feedback"}
                  </Button>
                </form>
              </Form>
            )}
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center space-y-2">
            <h3 className="font-display font-semibold">Bug Reports</h3>
            <p className="text-sm text-muted-foreground">
              Help us squash bugs and improve stability
            </p>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <h3 className="font-display font-semibold">Feature Requests</h3>
            <p className="text-sm text-muted-foreground">
              Share ideas for new features and improvements
            </p>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <h3 className="font-display font-semibold">Game Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Suggest new games you'd love to play
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
