import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Activity, ArrowLeft, BedDouble, CarFront, Check, CheckCircle2, Clock, Crosshair, Flame, HeartPulse, HelpCircle, MapPin, Phone, PhoneCall, QrCode, Radio, ScanLine, ShieldCheck, Siren, Truck, X } from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
//#region src/lib/vitalroute-data.ts
var INJURIES = [
	{
		id: "trauma",
		label: "Accident / Trauma",
		sub: "Bleeding, fracture, collision"
	},
	{
		id: "cardiac",
		label: "Cardiac Arrest",
		sub: "No pulse, unresponsive"
	},
	{
		id: "burn",
		label: "Severe Burn",
		sub: "Fire, scald, chemical"
	},
	{
		id: "other",
		label: "Other",
		sub: "Unclear or multiple"
	}
];
var RECOMMENDED = {
	trauma: {
		name: "St. Xavier Trauma Center",
		distance: "4.2 km",
		eta: "6 min via ambulance",
		capacity: "Trauma Surgeon & Bed Ready",
		ready: true,
		bedsFree: 4,
		bedsTotal: 12,
		phone: "+18005550142"
	},
	cardiac: {
		name: "Northgate Cardiac Institute",
		distance: "3.1 km",
		eta: "5 min via ambulance",
		capacity: "Cath Lab Open • ICU Bed Ready",
		ready: true,
		bedsFree: 2,
		bedsTotal: 8,
		phone: "+18005550188"
	},
	burn: {
		name: "Riverside Burn Unit",
		distance: "5.8 km",
		eta: "8 min via ambulance",
		capacity: "Burn Bay 2 Available",
		ready: true,
		bedsFree: 3,
		bedsTotal: 6,
		phone: "+18005550164"
	},
	other: {
		name: "City General Emergency",
		distance: "2.7 km",
		eta: "4 min via ambulance",
		capacity: "ER Physician Available",
		ready: true,
		bedsFree: 7,
		bedsTotal: 20,
		phone: "+18005550110"
	}
};
var ALTERNATIVES = [{
	name: "Mercy Hill Hospital",
	distance: "6.9 km",
	eta: "11 min",
	capacity: "2 beds • no trauma surgeon",
	ready: false,
	bedsFree: 2,
	bedsTotal: 14,
	phone: "+18005550176"
}, {
	name: "Lakeside Medical",
	distance: "9.4 km",
	eta: "15 min",
	capacity: "At capacity • diverting",
	ready: false,
	bedsFree: 0,
	bedsTotal: 10,
	phone: "+18005550193"
}];
var FIRST_AID = {
	trauma: {
		title: "Control the bleeding",
		rhythm: false,
		steps: [
			{
				title: "Do not move the patient",
				detail: "Unless there is fire or traffic danger."
			},
			{
				title: "Press firmly on the wound",
				detail: "Clean cloth. Hold steady pressure."
			},
			{
				title: "Keep them warm",
				detail: "Cover with a jacket. Talk to them."
			}
		]
	},
	cardiac: {
		title: "Start CPR — follow the pulse",
		rhythm: true,
		steps: [
			{
				title: "Push hard, centre of chest",
				detail: "Heel of hand, arms straight."
			},
			{
				title: "Match the pulsing ring",
				detail: "110 compressions per minute."
			},
			{
				title: "Do not stop",
				detail: "Continue until medics take over."
			}
		]
	},
	burn: {
		title: "Cool the burn",
		rhythm: false,
		steps: [
			{
				title: "Cool running water, 20 min",
				detail: "Never ice, never butter."
			},
			{
				title: "Remove tight items",
				detail: "Rings, watches, belts — not stuck fabric."
			},
			{
				title: "Cover loosely",
				detail: "Cling film or a clean non-fluffy cloth."
			}
		]
	},
	other: {
		title: "Keep them stable",
		rhythm: false,
		steps: [
			{
				title: "Check breathing",
				detail: "Tilt head back, look at the chest."
			},
			{
				title: "Recovery position",
				detail: "On their side if unconscious but breathing."
			},
			{
				title: "Stay on this screen",
				detail: "Medics will sync on arrival."
			}
		]
	}
};
//#endregion
//#region src/features/emergency/components/map-canvas.tsx
function MapUpdater({ center }) {
	const map = useMap();
	useEffect(() => {
		if (center) map.setView(center, map.getZoom(), { animate: true });
	}, [map, center]);
	return null;
}
/** Live map surface: aesthetic map plate + grid overlay + GPS pin. */
function MapCanvas({ dispatching = false }) {
	const [mounted, setMounted] = useState(false);
	const [location, setLocation] = useState(null);
	const [accuracy, setAccuracy] = useState(null);
	useEffect(() => {
		setMounted(true);
		if ("geolocation" in navigator) {
			const watchId = navigator.geolocation.watchPosition((pos) => {
				setLocation([pos.coords.latitude, pos.coords.longitude]);
				setAccuracy(pos.coords.accuracy);
			}, (err) => console.warn("Geolocation error:", err), {
				enableHighAccuracy: true,
				maximumAge: 0,
				timeout: 5e3
			});
			return () => navigator.geolocation.clearWatch(watchId);
		}
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 overflow-hidden bg-zinc-950",
		children: [
			mounted && /* @__PURE__ */ jsxs(MapContainer, {
				center: location || [51.505, -.09],
				zoom: 16,
				zoomControl: false,
				attributionControl: false,
				style: {
					height: "100%",
					width: "100%",
					zIndex: 0
				},
				children: [/* @__PURE__ */ jsx(TileLayer, {
					url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
					attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OSM</a> contributors"
				}), /* @__PURE__ */ jsx(MapUpdater, { center: location })]
			}),
			/* @__PURE__ */ jsx("div", { className: "grid-map absolute inset-0 opacity-60 pointer-events-none z-10" }),
			/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/55 via-background/10 to-background pointer-events-none z-10" }),
			/* @__PURE__ */ jsxs("div", {
				className: "absolute top-[38%] left-1/2 -translate-x-1/2 z-20 pointer-events-none",
				children: [
					/* @__PURE__ */ jsx("span", { className: "absolute -inset-16 rounded-full border border-primary/40 animate-halo" }),
					/* @__PURE__ */ jsx("span", {
						className: "absolute -inset-16 rounded-full border border-primary/30 animate-halo",
						style: { animationDelay: "1.4s" }
					}),
					/* @__PURE__ */ jsx("div", {
						className: "relative grid h-14 w-14 place-items-center rounded-full bg-primary/15 shadow-[var(--shadow-glow-primary)] ring-1 ring-primary/60",
						children: /* @__PURE__ */ jsx(Crosshair, { className: "h-7 w-7 text-primary" })
					})
				]
			}),
			dispatching && /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 animate-heartbeat pointer-events-none z-20",
				style: { background: "var(--gradient-heartbeat)" }
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass absolute top-20 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 z-20",
				children: [/* @__PURE__ */ jsx(Radio, { className: `h-3.5 w-3.5 ${location ? "text-primary animate-pulse" : "text-muted-foreground"}` }), /* @__PURE__ */ jsx("span", {
					className: "text-[0.7rem] font-medium tracking-wide text-muted-foreground",
					children: location ? `GPS locked · ${accuracy ? Math.round(accuracy) : "--"} m accuracy` : "Acquiring GPS..."
				})]
			})
		]
	});
}
//#endregion
//#region src/features/emergency/components/injury-selector.tsx
var ICONS = {
	trauma: CarFront,
	cardiac: HeartPulse,
	burn: Flame,
	other: HelpCircle
};
/** State 1 — bottom emergency selector with massive tap targets. */
function InjurySelector({ onSelect }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-rise-in glass-strong relative rounded-t-3xl px-4 pt-5 pb-8",
		children: [/* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute inset-0 animate-heartbeat rounded-t-3xl",
			style: { background: "var(--gradient-heartbeat)" }
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ jsx("div", { className: "mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" }),
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-xs font-semibold tracking-[0.18em] text-primary uppercase",
					children: "Step 1 of 2"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-1 text-center text-2xl font-bold tracking-tight",
					children: "Select Emergency"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-center text-sm text-muted-foreground",
					children: "Tap what you see. We handle the rest."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-5 grid grid-cols-2 gap-3",
					children: INJURIES.map((injury) => {
						const Icon = ICONS[injury.id];
						const isCritical = injury.id === "cardiac" || injury.id === "trauma";
						return /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => onSelect(injury.id),
							className: `group flex min-h-36 flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-300 ease-in-out active:scale-[0.97] ${isCritical ? "border-alert/40 bg-alert/10 hover:border-alert hover:shadow-[var(--shadow-glow-alert)]" : "border-border bg-secondary/50 hover:border-primary/60 hover:shadow-[var(--shadow-glow-primary)]"}`,
							children: [/* @__PURE__ */ jsx(Icon, { className: `h-9 w-9 transition-transform duration-300 ease-in-out group-active:scale-110 ${isCritical ? "text-alert" : "text-primary"}` }), /* @__PURE__ */ jsxs("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block text-base leading-tight font-semibold",
									children: injury.label
								}), /* @__PURE__ */ jsx("span", {
									className: "mt-1 block text-xs text-muted-foreground",
									children: injury.sub
								})]
							})]
						}, injury.id);
					})
				})
			]
		})]
	});
}
//#endregion
//#region src/features/emergency/components/scan-overlay.tsx
/** State 2 — scanning / matchmaking overlay. */
function ScanOverlay({ label }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-soft-in absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 animate-heartbeat",
				style: { background: "var(--gradient-scan)" }
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative grid h-56 w-56 place-items-center",
				children: [
					[
						0,
						1,
						2
					].map((i) => /* @__PURE__ */ jsx("span", {
						className: "absolute inset-0 rounded-full border border-primary/25 animate-halo",
						style: { animationDelay: `${i * .9}s` }
					}, i)),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-6 rounded-full border border-primary/20" }),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-16 rounded-full border border-primary/20" }),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 animate-radar rounded-full [mask-image:conic-gradient(from_0deg,black,transparent_55%)] bg-[conic-gradient(from_0deg,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_55%)]" }),
					/* @__PURE__ */ jsx(Activity, { className: "relative h-10 w-10 text-primary" })
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "relative mt-10 px-8 text-center text-xl font-semibold text-foreground",
				children: "Locating nearest available trauma beds…"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "relative mt-2 text-sm text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative mt-8 w-56 space-y-2 text-xs text-muted-foreground/80",
				children: [
					"GPS position sent",
					"Querying live bed capacity",
					"Ranking by ETA"
				].map((s, i) => /* @__PURE__ */ jsxs("p", {
					className: "animate-rise-in",
					style: { animationDelay: `${i * .35}s` },
					children: [/* @__PURE__ */ jsx("span", {
						className: "mr-2 text-primary",
						children: "▸"
					}), s]
				}, s))
			})
		]
	});
}
//#endregion
//#region src/features/emergency/components/recommendation-sheet.tsx
function BedMeter({ free, total }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ jsxs("span", {
			className: `text-sm font-semibold ${free === 0 ? "text-alert" : free <= 2 ? "text-warn" : "text-safe"}`,
			children: [
				free,
				"/",
				total,
				" beds free"
			]
		}), /* @__PURE__ */ jsx("span", {
			className: "flex gap-1",
			"aria-hidden": true,
			children: Array.from({ length: Math.min(total, 6) }).map((_, i) => /* @__PURE__ */ jsx("span", { className: `h-1.5 w-3 rounded-full ${i < Math.min(free, 6) ? "bg-safe" : "bg-border"}` }, i))
		})]
	});
}
/** State 3 — zero-guesswork recommendation. */
function RecommendationSheet({ injury, onDispatch, onBack }) {
	const best = RECOMMENDED[injury];
	const label = INJURIES.find((i) => i.id === injury)?.label ?? "Emergency";
	const [called, setCalled] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-rise-in glass-strong relative max-h-[82vh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-8",
		children: [
			/* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onBack,
					"aria-label": "Change emergency type",
					className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary/60 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-foreground",
					children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" })
				}), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate text-xs font-semibold tracking-[0.18em] text-alert uppercase",
						children: label
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "Best match found — call, then dispatch"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 rounded-3xl border border-primary/40 bg-primary/8 p-5 shadow-[var(--shadow-glow-primary)]",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap items-center gap-2",
						children: /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-safe/15 px-3 py-1 text-xs font-semibold text-safe ring-1 ring-safe/40",
							children: [/* @__PURE__ */ jsx(BedDouble, { className: "h-3.5 w-3.5" }), best.capacity]
						})
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "mt-3 text-[1.7rem] leading-tight font-bold tracking-tight",
						children: best.name
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-3",
						children: /* @__PURE__ */ jsx(BedMeter, {
							free: best.bedsFree,
							total: best.bedsTotal
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-muted-foreground",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-primary" }), best.distance]
						}), /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary" }), best.eta]
						})]
					}),
					/* @__PURE__ */ jsxs("a", {
						href: `tel:${best.phone}`,
						onClick: () => setCalled(true),
						className: "mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-all duration-300 ease-in-out active:scale-[0.98]",
						children: [called ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5" }), called ? "Hospital called" : "Call this hospital"]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-xs text-muted-foreground/80",
						children: "Capacity verified 12 seconds ago via live hospital feed."
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 mb-2 text-xs font-medium tracking-[0.16em] text-muted-foreground/70 uppercase",
				children: "Alternatives"
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "space-y-2",
				children: ALTERNATIVES.map((h) => /* @__PURE__ */ jsxs("li", {
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate text-sm font-medium",
							children: h.name
						}), /* @__PURE__ */ jsxs("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								h.bedsFree,
								"/",
								h.bedsTotal,
								" beds free · ",
								h.distance,
								" · ",
								h.eta
							]
						})]
					}), /* @__PURE__ */ jsx("a", {
						href: `tel:${h.phone}`,
						"aria-label": `Call ${h.name}`,
						className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary transition-colors duration-300 ease-in-out hover:bg-primary/20",
						children: /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" })
					})]
				}, h.name))
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: onDispatch,
				className: "mt-6 flex w-full items-center justify-center gap-3 rounded-3xl bg-alert py-6 text-lg font-bold tracking-tight text-alert-foreground shadow-[var(--shadow-glow-alert)] transition-all duration-300 ease-in-out active:scale-[0.98]",
				children: [/* @__PURE__ */ jsx(Siren, { className: "h-6 w-6" }), "Dispatch Ambulance & Alert Hospital"]
			}),
			!called && /* @__PURE__ */ jsx("p", {
				className: "mt-2 text-center text-xs text-muted-foreground/70",
				children: "Tip: call the hospital first so they prep the bay."
			})
		]
	});
}
//#endregion
//#region src/features/emergency/components/first-aid-card.tsx
/** State 5 — visual first aid, tailored to the selected injury. */
function FirstAidCard({ injury }) {
	const guide = FIRST_AID[injury];
	return /* @__PURE__ */ jsxs("div", {
		className: "glass animate-rise-in rounded-3xl p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold tracking-[0.16em] text-primary uppercase",
						children: "While you wait"
					}), /* @__PURE__ */ jsx("h3", {
						className: "mt-1 truncate text-xl font-bold tracking-tight",
						children: guide.title
					})]
				}), /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6 shrink-0 text-primary" })]
			}),
			guide.rhythm && /* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-col items-center",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "relative grid h-32 w-32 place-items-center",
					children: [
						/* @__PURE__ */ jsx("span", { className: "absolute inset-0 animate-cpr rounded-full bg-alert/20" }),
						/* @__PURE__ */ jsx("span", {
							className: "absolute inset-4 animate-cpr rounded-full bg-alert/30",
							style: { animationDelay: "0.06s" }
						}),
						/* @__PURE__ */ jsx(HeartPulse, { className: "animate-cpr relative h-12 w-12 text-alert" })
					]
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-3 text-sm font-medium text-muted-foreground",
					children: "Push down on every beat · 110 / min"
				})]
			}),
			/* @__PURE__ */ jsx("ol", {
				className: "mt-5 space-y-3",
				children: guide.steps.map((step, i) => /* @__PURE__ */ jsxs("li", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx("span", {
						className: "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/35",
						children: i + 1
					}), /* @__PURE__ */ jsxs("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block text-base leading-snug font-semibold",
							children: step.title
						}), /* @__PURE__ */ jsx("span", {
							className: "block text-sm text-muted-foreground",
							children: step.detail
						})]
					})]
				}, step.title))
			})
		]
	});
}
//#endregion
//#region src/features/emergency/components/long-press-button.tsx
/** Long-press button — prevents accidental cancellation during panic. */
function LongPressButton({ onComplete, children, holdMs = 1400, className = "" }) {
	const [progress, setProgress] = useState(0);
	const raf = useRef(null);
	const start = useRef(0);
	const stop = () => {
		if (raf.current) cancelAnimationFrame(raf.current);
		raf.current = null;
		setProgress(0);
	};
	useEffect(() => stop, []);
	const begin = () => {
		start.current = performance.now();
		const tick = () => {
			const p = Math.min(1, (performance.now() - start.current) / holdMs);
			setProgress(p);
			if (p >= 1) {
				stop();
				onComplete();
				return;
			}
			raf.current = requestAnimationFrame(tick);
		};
		raf.current = requestAnimationFrame(tick);
	};
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onPointerDown: begin,
		onPointerUp: stop,
		onPointerLeave: stop,
		onPointerCancel: stop,
		className: `relative overflow-hidden rounded-2xl border border-border/70 px-5 py-4 text-sm font-medium text-muted-foreground transition-colors duration-300 ease-in-out select-none active:text-foreground ${className}`,
		children: [/* @__PURE__ */ jsx("span", {
			"aria-hidden": true,
			className: "absolute inset-y-0 left-0 bg-destructive/25 transition-none",
			style: { width: `${progress * 100}%` }
		}), /* @__PURE__ */ jsx("span", {
			className: "relative",
			children: progress > 0 ? "Keep holding to cancel…" : children
		})]
	});
}
//#endregion
//#region src/features/emergency/components/qr-matrix.tsx
/**
* Deterministic decorative QR-style matrix (mock handoff token).
* No network, no dependency — renders as a high-contrast grid.
*/
var SIZE = 25;
function hash(x, y, seed) {
	const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
	return n - Math.floor(n);
}
function isFinder(x, y) {
	const inBox = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
	const ring = (ox, oy) => {
		const dx = x - ox;
		const dy = y - oy;
		return dx === 0 || dy === 0 || dx === 6 || dy === 6 || dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
	};
	if (inBox(0, 0)) return ring(0, 0);
	if (inBox(18, 0)) return ring(18, 0);
	if (inBox(0, 18)) return ring(0, 18);
	return false;
}
function isFinderArea(x, y) {
	return x < 8 && y < 8 || x >= 17 && y < 8 || x < 8 && y >= 17;
}
function QrMatrix({ seed = 7 }) {
	const cells = [];
	for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) cells.push(isFinderArea(x, y) ? isFinder(x, y) : hash(x, y, seed) > .5);
	return /* @__PURE__ */ jsx("div", {
		role: "img",
		"aria-label": "Paramedic handoff code",
		className: "grid aspect-square w-full max-w-[15rem] gap-0 rounded-xl bg-foreground p-3",
		style: { gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` },
		children: cells.map((on, i) => /* @__PURE__ */ jsx("span", {
			className: on ? "bg-background" : "bg-transparent",
			style: { aspectRatio: "1 / 1" }
		}, i))
	});
}
//#endregion
//#region src/features/emergency/components/active-dispatch.tsx
var START_SECONDS = 345;
function fmt(total) {
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
/** States 4 + 5 — active dispatch, medic handoff and visual first aid. */
function ActiveDispatch({ injury, onCancel }) {
	const [seconds, setSeconds] = useState(START_SECONDS);
	const [showQr, setShowQr] = useState(false);
	const hospital = RECOMMENDED[injury];
	useEffect(() => {
		const id = setInterval(() => setSeconds((s) => s > 0 ? s - 1 : 0), 1e3);
		return () => clearInterval(id);
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-rise-in relative flex min-h-full flex-col gap-4 px-4 pt-4 pb-8",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "glass-strong relative overflow-hidden rounded-3xl p-6 text-center",
				children: [/* @__PURE__ */ jsx("div", {
					className: "pointer-events-none absolute inset-0 animate-heartbeat",
					style: { background: "var(--gradient-heartbeat)" }
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "mx-auto grid h-14 w-14 place-items-center rounded-full bg-safe/15 ring-1 ring-safe/45",
							children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8 text-safe" })
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mt-4 text-3xl font-bold tracking-tight",
							children: "Ambulance Dispatched."
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [hospital.name, " has been pre-alerted and is preparing for arrival."]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-6 text-xs font-semibold tracking-[0.18em] text-primary uppercase",
							children: "Arriving in"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "font-sans text-6xl font-bold tabular-nums tracking-tight text-foreground",
							children: fmt(seconds)
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border",
							children: [
								/* @__PURE__ */ jsx(Truck, { className: "h-4 w-4 text-primary" }),
								"Unit 12 en route · ",
								hospital.distance
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass rounded-3xl p-5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "truncate text-base font-semibold",
							children: "Paramedic Handoff"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "Medics scan this to instantly pull the live dispatch timeline and patient vitals."
						})]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setShowQr((v) => !v),
						className: "inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-in-out active:scale-95",
						children: [showQr ? /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4" }), "Medic Sync"]
					})]
				}), showQr && /* @__PURE__ */ jsxs("div", {
					className: "animate-soft-in mt-5 flex flex-col items-center",
					children: [
						/* @__PURE__ */ jsx(QrMatrix, { seed: injury.length + 3 }),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ jsx(ScanLine, { className: "h-3.5 w-3.5 text-primary" }), "Hold the screen toward the paramedic's scanner"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 font-mono text-[0.7rem] tracking-widest text-muted-foreground/70",
							children: ["VR-8421-", injury.toUpperCase()]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(FirstAidCard, { injury }),
			/* @__PURE__ */ jsxs("a", {
				href: "tel:911",
				className: "flex items-center justify-center gap-3 rounded-3xl border border-alert/50 bg-alert/12 py-5 text-base font-semibold text-foreground transition-colors duration-300 ease-in-out active:bg-alert/20",
				children: [/* @__PURE__ */ jsx(PhoneCall, { className: "h-5 w-5 text-alert" }), "Call Emergency Directly"]
			}),
			/* @__PURE__ */ jsx(LongPressButton, {
				onComplete: onCancel,
				className: "mx-auto w-full max-w-xs",
				children: "Hold to Cancel SOS"
			})
		]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function VitalRoute() {
	const [phase, setPhase] = useState("idle");
	const [injury, setInjury] = useState("trauma");
	const timer = useRef(null);
	useEffect(() => {
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, []);
	const handleSelect = (id) => {
		setInjury(id);
		setPhase("scanning");
		timer.current = setTimeout(() => setPhase("recommendation"), 1500);
	};
	const reset = () => {
		if (timer.current) clearTimeout(timer.current);
		setPhase("idle");
	};
	const injuryLabel = INJURIES.find((i) => i.id === injury)?.label ?? "";
	return /* @__PURE__ */ jsxs("main", {
		className: "relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-background",
		children: [
			phase !== "dispatched" && /* @__PURE__ */ jsx(MapCanvas, {}),
			/* @__PURE__ */ jsxs("header", {
				className: "relative z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex min-w-0 items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("span", {
						className: "grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/45",
						children: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-primary" })
					}), /* @__PURE__ */ jsxs("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block truncate text-lg leading-none font-bold tracking-tight",
							children: "VitalRoute"
						}), /* @__PURE__ */ jsx("span", {
							className: "block text-[0.7rem] text-muted-foreground",
							children: "Emergency response, two taps"
						})]
					})]
				}), /* @__PURE__ */ jsxs("span", {
					className: "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 text-[0.7rem] font-medium text-muted-foreground ring-1 ring-border",
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-safe" }), "Live"]
				})]
			}),
			phase === "dispatched" ? /* @__PURE__ */ jsx("div", {
				className: "relative z-20 flex-1",
				children: /* @__PURE__ */ jsx(ActiveDispatch, {
					injury,
					onCancel: reset
				})
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", { className: "flex-1" }), /* @__PURE__ */ jsx("div", {
				className: "relative z-20",
				children: phase === "recommendation" ? /* @__PURE__ */ jsx(RecommendationSheet, {
					injury,
					onBack: reset,
					onDispatch: () => setPhase("dispatched")
				}) : /* @__PURE__ */ jsx(InjurySelector, { onSelect: handleSelect })
			})] }),
			phase === "scanning" && /* @__PURE__ */ jsx(ScanOverlay, { label: injuryLabel })
		]
	});
}
//#endregion
export { VitalRoute as component };
