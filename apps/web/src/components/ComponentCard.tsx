"use client";

import Link from "next/link";
import { ComponentPreview } from "./ComponentPreview";
import { VoteButton } from "./VoteButton";
import { CategoryBadge } from "./CategoryBadge";
import { formatDate } from "@openui/ui";
import { GitFork, MessageSquare, Eye } from "lucide-react";
import type { ComponentWithAuthor } from "@/types";

interface Props {
  component: ComponentWithAuthor;
  userVote?: 1 | -1 | null;
}

export function ComponentCard({ component, userVote = null }: Props) {
  return (
    <div
      className="card-hover"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Preview */}
      <Link
        href={`/component/${component.id}`}
        style={{ display: "block", overflow: "hidden" }}
      >
        <ComponentPreview component={component} height={180} />
      </Link>

      {/* Content */}
      <div
        style={{
          padding: "1rem",
          display: "flex",
          gap: "0.75rem",
          flex: 1,
        }}
      >
        {/* Vote */}
        <VoteButton
          componentId={component.id}
          initialScore={component.voteScore}
          initialUserVote={userVote}
        />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/component/${component.id}`}
            style={{
              textDecoration: "none",
              color: "var(--color-text-primary)",
            }}
          >
            <h3
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                marginBottom: "0.375rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {component.title}
            </h3>
          </Link>

          {/* Author & Date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {component.author.avatarUrl && (
              <img
                src={component.author.avatarUrl}
                alt={component.author.username || ""}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                }}
              />
            )}
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {component.author.username}
            </span>
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
              }}
            >
              · {formatDate(component.createdAt)}
            </span>
          </div>

          {/* Category & Tags */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              flexWrap: "wrap",
              marginBottom: "0.5rem",
            }}
          >
            <CategoryBadge category={component.category} />
            {component.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.6875rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "4px",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "var(--color-brand-light)",
                }}
              >
                {tag}
              </span>
            ))}
            {component.tags.length > 3 && (
              <span
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-text-muted)",
                }}
              >
                +{component.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.75rem",
              color: "var(--color-text-tertiary)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <GitFork size={13} />
              {component._count.forks}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <MessageSquare size={13} />
              {component._count.suggestions}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Eye size={13} />
              {component.viewCount || 0}
            </span>
          </div>

          {/* Forked badge */}
          {component.forkedFromId && (
            <div
              style={{
                marginTop: "0.375rem",
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              ↳ Forked
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
