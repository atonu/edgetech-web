'use client';
import React from 'react';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileText,
  Lock,
  RefreshCw,
  Building,
  Users,
  Award,
  Phone,
  HelpCircle,
  Clock,
  AlertCircle,
  Eye,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import AdminEditableText from './AdminEditableText';
import AddSectionForm from './AddSectionForm';
import SectionDeleteButton from './SectionDeleteButton';
import styles from '@/app/compliance.module.css';

interface PolicyPageRendererProps {
  slug: string;
  defaultBadgeIcon?: React.ReactNode;
}

// Icon helper per section index or title
function getSectionIcon(slug: string, title: string, index: number) {
  const t = title.toLowerCase();
  if (t.includes('company') || t.includes('legal') || t.includes('overview')) return <ShieldCheck size={20} className={styles.listIcon} />;
  if (t.includes('delivery') || t.includes('fulfillment')) return <Truck size={20} className={styles.listIcon} />;
  if (t.includes('order') || t.includes('pricing') || t.includes('eligibility')) return <CheckCircle2 size={20} className={styles.listIcon} />;
  if (t.includes('return') || t.includes('refund') || t.includes('resolution')) return <RefreshCw size={20} className={styles.listIcon} />;
  if (t.includes('advertisement') || t.includes('third-party') || t.includes('disclaimer')) return <AlertCircle size={20} className={styles.listIcon} />;
  if (t.includes('payment') || t.includes('emi') || t.includes('security')) return <ShieldCheck size={20} className={styles.listIcon} />;
  if (t.includes('law') || t.includes('jurisdiction')) return <FileText size={20} className={styles.listIcon} />;
  if (t.includes('privacy') || t.includes('protection')) return <Lock size={20} className={styles.listIcon} />;
  if (t.includes('collect') || t.includes('information')) return <Eye size={20} className={styles.listIcon} />;
  if (t.includes('management') || t.includes('leadership')) return <Users size={20} className={styles.listIcon} />;
  if (t.includes('commitment') || t.includes('vision') || t.includes('mission')) return <Award size={20} className={styles.listIcon} />;
  if (t.includes('contact') || t.includes('channel') || t.includes('helpline')) return <Phone size={20} className={styles.listIcon} />;
  if (t.includes('registered')) return <Building size={20} className={styles.listIcon} />;
  return <CheckCircle2 size={20} className={styles.listIcon} />;
}

export default function PolicyPageRenderer({ slug, defaultBadgeIcon }: PolicyPageRendererProps) {
  const { page, loading, updateField, addSection, deleteSection } = usePolicyPage(slug);

  if (loading && !page) {
    return (
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.header}>
            <div style={{ height: 28, width: 140, background: 'rgba(255,255,255,0.05)', borderRadius: 999, margin: '0 auto 16px' }} />
            <div style={{ height: 42, width: 320, background: 'rgba(255,255,255,0.05)', borderRadius: 8, margin: '0 auto 12px' }} />
            <div style={{ height: 20, width: 480, background: 'rgba(255,255,255,0.05)', borderRadius: 6, margin: '0 auto' }} />
          </div>
          <div className={styles.contentCard} style={{ minHeight: 400, opacity: 0.6 }}>
            <div style={{ height: 24, width: 220, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 16 }} />
            <div style={{ height: 80, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 24 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className={styles.pageContainer}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>The requested policy page could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        {/* Page Header */}
        <header className={styles.header}>
          <span className={styles.badge}>
            {defaultBadgeIcon || <FileText size={14} />}
            <AdminEditableText
              value={page.badge}
              onSave={(val) => updateField('badge', val)}
              label="Badge Label"
            />
          </span>

          <AdminEditableText
            as="h1"
            className={styles.title}
            value={page.title}
            onSave={(val) => updateField('title', val)}
            label="Page Title"
          />

          <AdminEditableText
            as="p"
            className={styles.subtitle}
            value={page.subtitle}
            onSave={(val) => updateField('subtitle', val)}
            multiline
            label="Subtitle"
          />

          {page.lastUpdated ? (
            <AdminEditableText
              as="p"
              className={styles.lastUpdated}
              value={page.lastUpdated}
              onSave={(val) => updateField('lastUpdated', val)}
              label="Last Updated Date"
            >
              Last Updated: {page.lastUpdated}
            </AdminEditableText>
          ) : (
            <AdminEditableText
              as="p"
              className={styles.lastUpdated}
              value={page.lastUpdated}
              onSave={(val) => updateField('lastUpdated', val)}
              label="Last Updated (Optional)"
            />
          )}
        </header>

        {/* Content Card with Sections */}
        <div className={styles.contentCard}>
          {page.sections && page.sections.length > 0 ? (
            page.sections.map((sec, idx) => {
              const isManagementTeam =
                sec.subItems &&
                sec.subItems.length > 0 &&
                sec.subItems.some((si) => si.subtitle || si.tag);

              return (
                <section key={sec.id || idx} className={styles.section}>
                  {/* Section Title & Delete Button */}
                  <div className={styles.sectionHeaderRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {getSectionIcon(slug, sec.title, idx)}
                      <AdminEditableText
                        as="h2"
                        className={styles.sectionTitle}
                        style={{ margin: 0 }}
                        value={sec.title}
                        onSave={(val) => updateField(`sections/${sec.id}/title`, val)}
                        label="Section Title"
                      />
                    </div>
                    <SectionDeleteButton
                      sectionTitle={sec.title}
                      onDelete={() => deleteSection(sec.id)}
                    />
                  </div>

                  {/* Section Body Text */}
                  {sec.body && (
                    <div style={{ marginBottom: 12 }}>
                      {sec.body.split('\n\n').map((paragraph, pIdx) => (
                        <AdminEditableText
                          key={pIdx}
                          as="p"
                          className={styles.sectionText}
                          value={sec.body}
                          onSave={(val) => updateField(`sections/${sec.id}/body`, val)}
                          multiline
                          label="Section Body"
                        >
                          {paragraph}
                        </AdminEditableText>
                      ))}
                    </div>
                  )}

                  {/* Highlight Box if present */}
                  {(sec.highlightTitle || sec.highlightText) && (
                    <div className={styles.highlightBox}>
                      {sec.highlightTitle && (
                        <AdminEditableText
                          as="div"
                          className={styles.highlightBoxTitle}
                          value={sec.highlightTitle}
                          onSave={(val) => updateField(`sections/${sec.id}/highlightTitle`, val)}
                          label="Highlight Box Title"
                        />
                      )}
                      {sec.highlightText && (
                        <AdminEditableText
                          as="div"
                          className={styles.highlightBoxText}
                          style={{ whiteSpace: 'pre-line' }}
                          value={sec.highlightText}
                          onSave={(val) => updateField(`sections/${sec.id}/highlightText`, val)}
                          multiline
                          label="Highlight Box Content"
                        />
                      )}
                    </div>
                  )}

                  {/* Bullet List Items if present */}
                  {sec.listItems && sec.listItems.length > 0 && (
                    <ul className={styles.list}>
                      {sec.listItems.map((item, itemIdx) => (
                        <li key={itemIdx} className={styles.listItem}>
                          <CheckCircle2 size={16} className={styles.listIcon} />
                          <AdminEditableText
                            as="span"
                            value={item}
                            onSave={(val) => updateField(`sections/${sec.id}/listItems/${itemIdx}`, val)}
                            label={`List Item ${itemIdx + 1}`}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Sub-items / Cards / Info Boxes */}
                  {sec.subItems && sec.subItems.length > 0 && (
                    <>
                      {isManagementTeam ? (
                        /* Team Management Grid (About page) */
                        <div className={styles.managementGrid}>
                          {sec.subItems.map((member) => (
                            <div key={member.id} className={styles.managementCard}>
                              <div className={styles.avatar}>
                                <AdminEditableText
                                  value={member.tag || 'ET'}
                                  onSave={(val) => updateField(`sections/${sec.id}/subItems/${member.id}/tag`, val)}
                                  label="Avatar Initials"
                                />
                              </div>
                              <AdminEditableText
                                as="div"
                                className={styles.personName}
                                value={member.title}
                                onSave={(val) => updateField(`sections/${sec.id}/subItems/${member.id}/title`, val)}
                                label="Person Name"
                              />
                              <AdminEditableText
                                as="div"
                                className={styles.personRole}
                                value={member.subtitle || ''}
                                onSave={(val) => updateField(`sections/${sec.id}/subItems/${member.id}/subtitle`, val)}
                                label="Job Title / Role"
                              />
                              <AdminEditableText
                                as="p"
                                className={styles.personBio}
                                value={member.text}
                                onSave={(val) => updateField(`sections/${sec.id}/subItems/${member.id}/text`, val)}
                                multiline
                                label="Biography"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Standard Two-Column Info Boxes */
                        <div className={styles.gridTwo}>
                          {sec.subItems.map((box) => (
                            <div key={box.id} className={styles.infoBox}>
                              <div className={styles.infoBoxTitle}>
                                <Clock size={16} />
                                <AdminEditableText
                                  value={box.title}
                                  onSave={(val) => updateField(`sections/${sec.id}/subItems/${box.id}/title`, val)}
                                  label="Box Title"
                                />
                              </div>
                              <AdminEditableText
                                as="p"
                                className={styles.infoBoxText}
                                style={{ whiteSpace: 'pre-line' }}
                                value={box.text}
                                onSave={(val) => updateField(`sections/${sec.id}/subItems/${box.id}/text`, val)}
                                multiline
                                label="Box Content"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </section>
              );
            })
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              No sections found.
            </p>
          )}

          {/* + ADD Section Form at the end of the page */}
          <AddSectionForm onAddSection={addSection} />
        </div>
      </div>
    </div>
  );
}
