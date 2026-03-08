'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Trash2, ArrowRight, ArrowLeft, Send, Sparkles } from 'lucide-react';

export type ResumeFormData = {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        website: string;
        title: string;
    };
    summary: string;
    skills: { name: string }[];
    experience: {
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    education: {
        school: string;
        degree: string;
        field: string;
        graduationDate: string;
    }[];
    projects: {
        name: string;
        description: string;
        link: string;
    }[];
    certifications: {
        name: string;
        issuer: string;
        date: string;
    }[];
};

const steps = [
    { id: 'personal', title: 'Personal Info' },
    { id: 'summary', title: 'Summary & Skills' },
    { id: 'experience', title: 'Experience' },
    { id: 'education', title: 'Education' },
    { id: 'projects', title: 'Projects & Certs' },
];

export default function ResumeForm({ initialData, resumeId }: { initialData?: ResumeFormData, resumeId?: string }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const { register, control, handleSubmit, formState: { errors } } = useForm<ResumeFormData>({
        defaultValues: {
            personalInfo: initialData?.personalInfo || { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '', title: '' },
            summary: initialData?.summary || '',
            skills: initialData?.skills || [{ name: '' }],
            experience: initialData?.experience || [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
            education: initialData?.education || [{ school: '', degree: '', field: '', graduationDate: '' }],
            projects: initialData?.projects || [],
            certifications: initialData?.certifications || [],
        }
    });

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' });
    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
    const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' });
    const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' });

    const nextStep = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };
    const prevStep = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data: ResumeFormData) => {
        setIsGenerating(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error('Not authenticated');
            }

            // 1. Call API to generate resume text with Groq API
            const response = await fetch('/api/generate-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to generate resume');
            const { generatedText } = await response.json();

            // 2. Save everything to Supabase
            if (resumeId) {
                await supabase.from('resumes').update({
                    resume_input_data: data,
                    generated_resume_text: generatedText
                }).eq('id', resumeId);
            } else {
                const { data: newResume, error } = await supabase.from('resumes').insert({
                    user_id: user.id,
                    resume_input_data: data,
                    generated_resume_text: generatedText
                }).select().single();

                if (error) throw error;
                resumeId = newResume.id;
            }

            // 3. Redirect to builder view with ID
            router.push(`/resume-builder?id=${resumeId}&preview=true`);
            router.refresh();

        } catch (error: any) {
            console.error(error);
            alert(`Error generating resume: ${error.message || 'Please try again.'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] border border-white/5 p-6 md:p-10 relative overflow-hidden mx-auto w-full max-w-4xl">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none mix-blend-screen"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://res.cloudinary.com/djp3rpxv9/image/upload/v1709191024/grid-pattern_nqzlkx.svg')] bg-[length:60px_60px] opacity-[0.03] pointer-events-none"></div>

            {/* Stepper */}
            <div className="mb-12 relative z-10">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-white/5 hidden sm:block rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>
                    {steps.map((step, index) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${index <= currentStep
                                    ? 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 text-white shadow-[0_0_25px_-3px_rgba(168,85,247,0.6)] scale-110 ring-4 ring-black'
                                    : 'bg-[#0a0a0a] border border-white/10 text-gray-500 backdrop-blur-md ring-4 ring-black group-hover:border-white/20'
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span className={`mt-4 text-[11px] uppercase tracking-widest font-bold hidden sm:block transition-colors duration-500 ${index <= currentStep ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400' : 'text-gray-600'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    const target = e.target as HTMLElement;
                    if (target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON') {
                        e.preventDefault();
                    }
                }
            }} className="space-y-8 relative z-10">

                {/* Step 1: Personal Info */}
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                                <input suppressHydrationWarning {...register('personalInfo.fullName', { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Target Title (e.g. Software Engineer)</label>
                                <input suppressHydrationWarning {...register('personalInfo.title', { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input suppressHydrationWarning type="email" {...register('personalInfo.email', { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Phone</label>
                                <input suppressHydrationWarning {...register('personalInfo.phone')} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Location</label>
                                <input suppressHydrationWarning {...register('personalInfo.location')} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">LinkedIn URL</label>
                                <input suppressHydrationWarning {...register('personalInfo.linkedin')} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">Portfolio / Website</label>
                                <input suppressHydrationWarning {...register('personalInfo.website')} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Summary & Skills */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Professional Summary</h2>
                            <p className="text-sm text-gray-400 mb-2">Write a brief overview of your background. Note: Our AI will enhance this professionally.</p>
                            <textarea suppressHydrationWarning {...register('summary')} rows={4} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600"></textarea>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Key Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {skillFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-1 bg-white/[0.02] p-1 pl-2 rounded-md border border-white/10">
                                        <input suppressHydrationWarning
                                            {...register(`skills.${index}.name` as const, { required: true })}
                                            placeholder="e.g. React.js"
                                            className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-white w-24 sm:w-32"
                                        />
                                        <button suppressHydrationWarning type="button" onClick={() => removeSkill(index)} className="p-1 text-gray-400 hover:text-red-500 rounded-md">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button suppressHydrationWarning
                                    type="button"
                                    onClick={() => appendSkill({ name: '' })}
                                    className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 font-medium p-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Skill
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Experience */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Work Experience</h2>
                            <button suppressHydrationWarning
                                type="button"
                                onClick={() => appendExp({ company: '', position: '', startDate: '', endDate: '', description: '' })}
                                className="group flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-5 py-2.5 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all duration-300 font-bold active:scale-[0.98] shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Job
                            </button>
                        </div>

                        <div className="space-y-8">
                            {expFields.map((field, index) => (
                                <div key={field.id} className="p-7 border border-white/5 rounded-3xl bg-black/30 relative group hover:border-white/10 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.1)] transition-all duration-500 backdrop-blur-sm">
                                    {expFields.length > 1 && (
                                        <button suppressHydrationWarning type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Company</label>
                                            <input suppressHydrationWarning {...register(`experience.${index}.company` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Position</label>
                                            <input suppressHydrationWarning {...register(`experience.${index}.position` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Start Date</label>
                                            <input suppressHydrationWarning type="month" {...register(`experience.${index}.startDate` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">End Date (or Present)</label>
                                            <input suppressHydrationWarning type="text" placeholder="YYYY-MM or Present" {...register(`experience.${index}.endDate` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300">Description / Achievements (Bullet points)</label>
                                            <p className="text-xs text-gray-400 mb-1">Outline your duties. The AI will translate these into high-impact bullet points.</p>
                                            <textarea suppressHydrationWarning rows={4} {...register(`experience.${index}.description` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600"></textarea>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Education */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Education</h2>
                            <button suppressHydrationWarning
                                type="button"
                                onClick={() => appendEdu({ school: '', degree: '', field: '', graduationDate: '' })}
                                className="group flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-5 py-2.5 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all duration-300 font-bold active:scale-[0.98] shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Education
                            </button>
                        </div>

                        <div className="space-y-6">
                            {eduFields.map((field, index) => (
                                <div key={field.id} className="p-7 border border-white/5 rounded-3xl bg-black/30 relative group hover:border-white/10 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.1)] transition-all duration-500 backdrop-blur-sm">
                                    {eduFields.length > 1 && (
                                        <button suppressHydrationWarning type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">School / University</label>
                                            <input suppressHydrationWarning {...register(`education.${index}.school` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Graduation Date</label>
                                            <input suppressHydrationWarning type="month" {...register(`education.${index}.graduationDate` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Degree (e.g. B.S., M.A.)</label>
                                            <input suppressHydrationWarning {...register(`education.${index}.degree` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Field of Study</label>
                                            <input suppressHydrationWarning {...register(`education.${index}.field` as const, { required: true })} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Projects & Certifications */}
                {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Noteable Projects (Optional)</h2>
                                <button suppressHydrationWarning
                                    type="button"
                                    onClick={() => appendProj({ name: '', description: '', link: '' })}
                                    className="group flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-5 py-2.5 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all duration-300 font-bold active:scale-[0.98] shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add Project
                                </button>
                            </div>

                            <div className="space-y-4">
                                {projFields.map((field, index) => (
                                    <div key={field.id} className="p-7 border border-white/5 rounded-3xl bg-black/30 relative group hover:border-white/10 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.1)] transition-all duration-500 backdrop-blur-sm">
                                        <button suppressHydrationWarning type="button" onClick={() => removeProj(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300">Project Name</label>
                                                <input suppressHydrationWarning {...register(`projects.${index}.name` as const)} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300">Link</label>
                                                <input suppressHydrationWarning {...register(`projects.${index}.link` as const)} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-300">Description</label>
                                                <textarea suppressHydrationWarning rows={2} {...register(`projects.${index}.description` as const)} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {projFields.length === 0 && <p className="text-sm text-gray-400 italic">No projects added.</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center">Certifications (Optional)</h2>
                                <button suppressHydrationWarning
                                    type="button"
                                    onClick={() => appendCert({ name: '', issuer: '', date: '' })}
                                    className="group flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-5 py-2.5 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-all duration-300 font-bold active:scale-[0.98] shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add Cert
                                </button>
                            </div>

                            <div className="space-y-4">
                                {certFields.map((field, index) => (
                                    <div key={field.id} className="p-7 border border-white/5 rounded-3xl bg-black/30 relative group hover:border-white/10 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.1)] transition-all duration-500 backdrop-blur-sm">
                                        <button suppressHydrationWarning type="button" onClick={() => removeCert(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-300">Certification Name</label>
                                                <input suppressHydrationWarning {...register(`certifications.${index}.name` as const)} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300">Issuer / Date</label>
                                                <input suppressHydrationWarning placeholder="e.g. AWS, 2023" {...register(`certifications.${index}.issuer` as const)} className="mt-2 block w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-white transition-all duration-300 hover:border-indigo-500/30 hover:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-gray-600" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {certFields.length === 0 && <p className="text-sm text-gray-400 italic">No certifications added.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Actions */}
                <div className="flex justify-between pt-8 mt-4 border-t border-white/5">
                    <button suppressHydrationWarning
                        key="back-btn"
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 0 || isGenerating}
                        className="group inline-flex items-center px-6 py-3 border border-white/10 shadow-sm text-sm font-bold rounded-xl text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" /> Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button suppressHydrationWarning
                            key="next-btn"
                            type="button"
                            onClick={nextStep}
                            className="group inline-flex items-center px-10 py-3.5 border border-transparent text-sm font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-all duration-300 active:scale-[0.97]"
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    ) : (
                        <button suppressHydrationWarning
                            key="submit-btn"
                            type="submit"
                            disabled={isGenerating}
                            className="group relative inline-flex items-center justify-center px-10 py-3.5 text-sm font-bold text-white bg-black rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 transition-all hover:scale-105 active:scale-[0.98] duration-300 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-[1.5px] bg-black rounded-[10px] group-hover:bg-opacity-0 transition-all duration-300"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500"></div>

                            <span className="relative z-10 flex items-center">
                                {isGenerating ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin text-white" /> Generating Magic...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 text-white" /> Generate AI Resume</>
                                )}
                            </span>
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
