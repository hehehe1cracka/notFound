import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, X, Plus, Loader2 } from 'lucide-react';
import { User } from '@/types/momentum';

interface EditProfileDialogProps {
    trigger?: React.ReactNode;
}

export function EditProfileDialog({ trigger }: EditProfileDialogProps) {
    const { userProfile, updateUser } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const [formData, setFormData] = useState<Partial<User>>({
        displayName: userProfile?.displayName || '',
        bio: userProfile?.bio || '',
        role: userProfile?.role || 'talent',
        skills: userProfile?.skills || [],
        interests: userProfile?.interests || [],
        motivation: userProfile?.motivation || '',
        location: userProfile?.location || '',
        website: userProfile?.website || '',
        twitter: userProfile?.twitter || '',
        github: userProfile?.github || '',
        linkedin: userProfile?.linkedin || '',
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUser(formData);
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...(formData.skills || []), newSkill.trim()],
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills?.filter(s => s !== skill) || [],
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information to help others discover and connect with you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name *</Label>
                            <Input
                                id="displayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="founder">Founder</SelectItem>
                                    <SelectItem value="talent">Talent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Skills & Expertise</h3>

                        <div className="space-y-2">
                            <Label>Add Skills</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="e.g., React, Design, Marketing"
                                />
                                <Button type="button" onClick={addSkill} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {formData.skills && formData.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
                                        {skill}
                                        <button
                                            onClick={() => removeSkill(skill)}
                                            className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Motivation */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Motivation</h3>

                        <div className="space-y-2">
                            <Label htmlFor="motivation">What drives you?</Label>
                            <Textarea
                                id="motivation"
                                value={formData.motivation}
                                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                                placeholder="Share what motivates you to build..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Social Links</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub</Label>
                                <Input
                                    id="github"
                                    value={formData.github}
                                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                    placeholder="username"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    value={formData.twitter}
                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                    placeholder="@username"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    placeholder="username"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
