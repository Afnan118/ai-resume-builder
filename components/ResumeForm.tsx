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
        <div className="bg-white/[0.02] rounded-xl shadow-sm border border-white/10 p-6 md:p-8">
            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
                    {steps.map((step, index) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index <= currentStep
                                    ? 'bg-yellow-400 text-black shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span className={`mt-2 text-xs font-medium hidden sm:block ${index <= currentStep ? 'text-yellow-400' : 'text-gray-400'
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
            }} className="space-y-8">

                {/* Step 1: Personal Info */}
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                                <input suppressHydrationWarning {...register('personalInfo.fullName', { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Target Title (e.g. Software Engineer)</label>
                                <input suppressHydrationWarning {...register('personalInfo.title', { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input suppressHydrationWarning type="email" {...register('personalInfo.email', { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Phone</label>
                                <input suppressHydrationWarning {...register('personalInfo.phone')} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Location</label>
                                <input suppressHydrationWarning {...register('personalInfo.location')} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">LinkedIn URL</label>
                                <input suppressHydrationWarning {...register('personalInfo.linkedin')} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">Portfolio / Website</label>
                                <input suppressHydrationWarning {...register('personalInfo.website')} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Summary & Skills */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Professional Summary</h2>
                            <p className="text-sm text-gray-400 mb-2">Write a brief overview of your background. Note: Our AI will enhance this professionally.</p>
                            <textarea suppressHydrationWarning {...register('summary')} rows={4} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white"></textarea>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <h2 className="text-xl font-bold text-white mb-4">Key Skills</h2>
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
                                    className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 font-medium p-2"
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
                            <h2 className="text-xl font-bold text-white">Work Experience</h2>
                            <button suppressHydrationWarning
                                type="button"
                                onClick={() => appendExp({ company: '', position: '', startDate: '', endDate: '', description: '' })}
                                className="flex items-center gap-1 text-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-md hover:bg-yellow-400/20 transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Job
                            </button>
                        </div>

                        <div className="space-y-8">
                            {expFields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-white/10 rounded-lg bg-white/[0.02] relative">
                                    {expFields.length > 1 && (
                                        <button suppressHydrationWarning type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Company</label>
                                            <input suppressHydrationWarning {...register(`experience.${index}.company` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Position</label>
                                            <input suppressHydrationWarning {...register(`experience.${index}.position` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Start Date</label>
                                            <input suppressHydrationWarning type="month" {...register(`experience.${index}.startDate` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">End Date (or Present)</label>
                                            <input suppressHydrationWarning type="text" placeholder="YYYY-MM or Present" {...register(`experience.${index}.endDate` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300">Description / Achievements (Bullet points)</label>
                                            <p className="text-xs text-gray-400 mb-1">Outline your duties. The AI will translate these into high-impact bullet points.</p>
                                            <textarea suppressHydrationWarning rows={4} {...register(`experience.${index}.description` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white"></textarea>
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
                            <h2 className="text-xl font-bold text-white">Education</h2>
                            <button suppressHydrationWarning
                                type="button"
                                onClick={() => appendEdu({ school: '', degree: '', field: '', graduationDate: '' })}
                                className="flex items-center gap-1 text-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-md hover:bg-yellow-400/20 transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Education
                            </button>
                        </div>

                        <div className="space-y-6">
                            {eduFields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-white/10 rounded-lg bg-white/[0.02] relative">
                                    {eduFields.length > 1 && (
                                        <button suppressHydrationWarning type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">School / University</label>
                                            <input suppressHydrationWarning {...register(`education.${index}.school` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Graduation Date</label>
                                            <input suppressHydrationWarning type="month" {...register(`education.${index}.graduationDate` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Degree (e.g. B.S., M.A.)</label>
                                            <input suppressHydrationWarning {...register(`education.${index}.degree` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Field of Study</label>
                                            <input suppressHydrationWarning {...register(`education.${index}.field` as const, { required: true })} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
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
                                <h2 className="text-xl font-bold text-white">Noteable Projects (Optional)</h2>
                                <button suppressHydrationWarning
                                    type="button"
                                    onClick={() => appendProj({ name: '', description: '', link: '' })}
                                    className="flex items-center gap-1 text-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-md hover:bg-yellow-400/20 transition-colors font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add Project
                                </button>
                            </div>

                            <div className="space-y-4">
                                {projFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border border-white/10 rounded-lg bg-white/[0.02] relative">
                                        <button suppressHydrationWarning type="button" onClick={() => removeProj(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300">Project Name</label>
                                                <input suppressHydrationWarning {...register(`projects.${index}.name` as const)} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300">Link</label>
                                                <input suppressHydrationWarning {...register(`projects.${index}.link` as const)} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-300">Description</label>
                                                <textarea suppressHydrationWarning rows={2} {...register(`projects.${index}.description` as const)} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {projFields.length === 0 && <p className="text-sm text-gray-400 italic">No projects added.</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Certifications (Optional)</h2>
                                <button suppressHydrationWarning
                                    type="button"
                                    onClick={() => appendCert({ name: '', issuer: '', date: '' })}
                                    className="flex items-center gap-1 text-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-md hover:bg-yellow-400/20 transition-colors font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add Cert
                                </button>
                            </div>

                            <div className="space-y-4">
                                {certFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border border-white/10 rounded-lg bg-white/[0.02] relative">
                                        <button suppressHydrationWarning type="button" onClick={() => removeCert(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-300">Certification Name</label>
                                                <input suppressHydrationWarning {...register(`certifications.${index}.name` as const)} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300">Issuer / Date</label>
                                                <input suppressHydrationWarning placeholder="e.g. AWS, 2023" {...register(`certifications.${index}.issuer` as const)} className="mt-1 block w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 text-white" />
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
                <div className="flex justify-between pt-6 border-t border-white/10">
                    <button suppressHydrationWarning
                        key="back-btn"
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 0 || isGenerating}
                        className="inline-flex items-center px-4 py-2 border border-white/10 shadow-sm text-sm font-medium rounded-md text-gray-200 bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button suppressHydrationWarning
                            key="next-btn"
                            type="button"
                            onClick={nextStep}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button suppressHydrationWarning
                            key="submit-btn"
                            type="submit"
                            disabled={isGenerating}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating AI Resume...</>
                            ) : (
                                <><Sparkles className="w-4 h-4 mr-2" /> Generate ATS Resume</>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
