import React from 'react';
import Link from "next/link";


const Test = () => {
    const data = [
        {
            id: "cs-001",
            slug: "improving-search",
            title: "Improving Search Relevance",
            content: [
                {"type": "img", "src": "/images/ctr-chart.png", "alt": "CTR increase chart"},

                {"type": "h5", "value": "Problem"},
                {"type": "p", "value": "Users could not find relevant results in the search engine."},

                {"type": "p", "value": "We used A/B testing and improved ranking with a hybrid model."},


                {"type": "h2", "value": "Read More"},
                {"type": "link", "text": "Full research report", "href": "/reports/search-report.pdf"},
                {"type": "h4", "value": "Approach"},

            ]
        },

        {
            id: "cs-002",
            slug: "onboarding-revamp",
            title: "Mobile Onboarding Revamp",
            content: [
                {"type": "h1", "value": "Summary"},
                {"type": "p", "value": "We redesigned onboarding to reduce user friction."},
                {"type": "img", "src": "/images/onboarding.png", "alt": "Onboarding hero"},
                {"type": "link", "text": "View design notes", "href": "https://example.com/design-notes"}
            ]
        }
    ]

    const study = data[0]

    return (
        <div>
            <article className="max-w-3xl mx-auto py-10">
                <h1 className="text-3xl font-bold mb-4">{study?.title}</h1>
                <ContentRenderer content={study?.content}/>
            </article>
        </div>
    );
};

export function ContentRenderer({ content }: any) {
    return (
        <div className="space-y-4">
            {content.map((item: any, i: number) => {
                switch (item.type) {
                    case "h1":
                        return (
                            <h1 key={i} className="text-4xl font-bold leading-tight tracking-tight">
                                {item.value}
                            </h1>
                        );

                    case "h2":
                        return (
                            <h2 key={i} className="text-3xl font-semibold leading-snug tracking-tight">
                                {item.value}
                            </h2>
                        );

                    case "h3":
                        return (
                            <h3 key={i} className="text-2xl font-semibold leading-snug">
                                {item.value}
                            </h3>
                        );

                    case "h4":
                        return (
                            <h4 key={i} className="text-xl font-semibold">
                                {item.value}
                            </h4>
                        );

                    case "h5":
                        return (
                            <h5 key={i} className="text-lg font-medium">
                                {item.value}
                            </h5>
                        );

                    case "h6":
                        return (
                            <h6 key={i} className="text-base font-medium uppercase opacity-80">
                                {item.value}
                            </h6>
                        );

                    case "p":
                        return (
                            <p key={i} className="text-base leading-relaxed">
                                {item.value}
                            </p>
                        );

                    case "img":
                        return (
                            <img
                                key={i}
                                src={item.src}
                                alt={item.alt || ""}
                                className="rounded-lg my-4 max-w-full h-auto shadow-sm"
                            />
                        );

                    case "link":
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-500 hover:underline"
                            >
                                {item.text}
                            </Link>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}


export default Test;