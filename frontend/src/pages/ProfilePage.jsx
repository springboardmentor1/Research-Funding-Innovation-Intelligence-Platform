import ProfileOnboardingForm from "../components/ProfileOnboardingForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h2 className="text-xl font-bold mb-1">Complete your profile</h2>
        <p className="text-slate-400 text-sm mb-8">
          Helps us personalise funding and publication recommendations.
        </p>
        <ProfileOnboardingForm />
      </div>
    </div>
  );
}