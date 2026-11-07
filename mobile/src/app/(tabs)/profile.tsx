import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import {
  ChevronRight,
  CreditCard,
  LogOut,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { Screen } from "@/components/Screen";
import { SignInPrompt } from "@/components/SignInPrompt";
import { StatusBadge } from "@/components/StatusBadge";
import { api, type User } from "@/lib/api";
import { formatDate, formatMoney, initials } from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

export default function ProfileScreen() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.signedOutScroll}>
          <View style={styles.signedOutHeader}>
            <AppText variant="label" color={colors.muted}>
              Account
            </AppText>
            <AppText variant="h1" style={styles.signedOutTitle}>
              Your things, together.
            </AppText>
            <AppText style={styles.signedOutCopy}>
              Orders, receipts and the pieces you keep coming back to — all in
              one quiet place.
            </AppText>
          </View>
          <SignInPrompt
            title="Sign in to Forma"
            description="Use a guest session on this phone, or sign in by email to keep your account across devices."
            returnTo="/profile"
          />
        </ScrollView>
      </Screen>
    );
  }

  return <SignedInProfile user={user} />;
}

function SignedInProfile({ user }: { user: User }) {
  const { signOut } = useAuth();
  const orders = useQuery(api.orders.listMine);
  const payments = useQuery(api.payments.listMine);
  const adminExists = useQuery(api.profile.adminExists);
  const updateProfile = useMutation(api.profile.updateProfile);
  const claimAdmin = useMutation(api.profile.claimAdmin);

  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user.name) setName(user.name);
  }, [user.name]);

  const isAdmin = user.role === "admin";
  const spent = (payments ?? [])
    .filter((payment) => payment.status === "succeeded")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const orderCount = orders?.length ?? 0;
  const roleLabel = isAdmin
    ? "admin"
    : user.isAnonymous
      ? "guest"
      : "customer";

  async function saveName() {
    setSaveError(null);
    setSaveNote(null);
    if (!name.trim()) {
      setSaveError("Please enter a name.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setSaveNote("Saved.");
      setTimeout(() => setSaveNote(null), 2000);
    } catch (cause) {
      setSaveError(
        cause instanceof Error ? cause.message : "Could not save your name.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleClaimAdmin() {
    setClaimError(null);
    setClaiming(true);
    try {
      await claimAdmin({});
    } catch (cause) {
      setClaimError(
        cause instanceof Error
          ? cause.message
          : "Could not claim the admin role.",
      );
    } finally {
      setClaiming(false);
    }
  }

  function confirmSignOut() {
    Alert.alert(
      "Sign out?",
      "Your bag stays on this phone. Guest accounts cannot be recovered after signing out.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut();
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <AppText variant="label" color={colors.muted}>
            Account
          </AppText>
          <AppText variant="h1">Your profile</AppText>
        </View>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{initials(user.name)}</AppText>
          </View>
          <View style={styles.identityCopy}>
            <View style={styles.nameRow}>
              <AppText variant="h2" numberOfLines={1} style={styles.name}>
                {user.name ?? "Forma guest"}
              </AppText>
              <StatusBadge status={roleLabel} />
            </View>
            <AppText variant="small" color={colors.muted} numberOfLines={1}>
              {user.email ?? "Guest session on this device"}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              Member since {formatDate(user._creationTime)}
            </AppText>
          </View>
        </View>

        <View style={styles.stats}>
          <StatCard
            icon={<Package size={16} color={colors.pine} strokeWidth={1.7} />}
            label="Orders"
            value={orders === undefined ? "—" : String(orderCount)}
          />
          <StatCard
            icon={<CreditCard size={16} color={colors.pine} strokeWidth={1.7} />}
            label="Spent (demo)"
            value={payments === undefined ? "—" : formatMoney(spent)}
          />
        </View>

        {!isAdmin && adminExists === false ? (
          <View style={styles.claim}>
            <View style={styles.claimHead}>
              <View style={styles.claimIcon}>
                <ShieldCheck size={18} color={colors.pine} strokeWidth={1.7} />
              </View>
              <View style={styles.claimCopy}>
                <AppText variant="title">Claim the admin role</AppText>
                <AppText variant="small" color={colors.inkSoft} style={styles.claimBody}>
                  This demo store has no admin yet. Claim it once to unlock
                  order management, inventory and refunds on this account.
                </AppText>
              </View>
            </View>
            {claimError ? <Notice message={claimError} /> : null}
            <Button
              label="Claim admin"
              variant="secondary"
              size="sm"
              loading={claiming}
              onPress={handleClaimAdmin}
              style={styles.claimButton}
              icon={<Sparkles size={14} color={colors.ink} strokeWidth={1.8} />}
            />
          </View>
        ) : null}

        <View style={styles.actions}>
          <ActionRow
            icon={<Package size={18} color={colors.pine} strokeWidth={1.7} />}
            label="Orders"
            note={
              orders === undefined
                ? "Loading…"
                : `${orderCount} ${orderCount === 1 ? "order" : "orders"}`
            }
            onPress={() => router.push("/orders")}
          />
          <ActionRow
            icon={<CreditCard size={18} color={colors.pine} strokeWidth={1.7} />}
            label="Payments"
            note="Receipts & refunds"
            onPress={() => router.push("/payments")}
          />
          {isAdmin ? (
            <ActionRow
              icon={<ShieldCheck size={18} color={colors.pine} strokeWidth={1.7} />}
              label="Store admin"
              note="Orders, stock & refunds"
              onPress={() => router.push("/admin")}
            />
          ) : null}
        </View>

        <View style={styles.editCard}>
          <AppText variant="label" color={colors.muted}>
            Personal details
          </AppText>
          <AppText style={styles.editCopy}>
            The name used on receipts and orders. Your email is managed by the
            sign-in method.
          </AppText>
          <Field
            label="Display name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
            autoComplete="name"
            containerStyle={styles.field}
          />
          {saveError ? <Notice message={saveError} /> : null}
          {saveNote ? <Notice tone="info" message={saveNote} /> : null}
          <Button
            label="Save changes"
            variant="secondary"
            size="sm"
            loading={saving}
            onPress={saveName}
            style={styles.save}
          />
        </View>

        <Button
          label="Sign out"
          variant="ghost"
          onPress={confirmSignOut}
          loading={signingOut}
          icon={<LogOut size={15} color={colors.pine} strokeWidth={1.8} />}
          style={styles.signOut}
        />
        <AppText variant="small" color={colors.muted} style={styles.note}>
          Demo storefront. Payments are simulated and no money moves.
        </AppText>
      </ScrollView>
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>{icon}</View>
      <View style={styles.statCopy}>
        <AppText variant="label" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="price" style={styles.statValue} numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  note,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  note: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionCopy}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText variant="small" color={colors.muted}>
          {note}
        </AppText>
      </View>
      <ChevronRight size={17} color={colors.muted} strokeWidth={1.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 36,
  },
  signedOutScroll: {
    paddingBottom: 36,
  },
  signedOutHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 6,
  },
  signedOutTitle: {
    maxWidth: 310,
  },
  signedOutCopy: {
    color: colors.muted,
    lineHeight: 21,
    maxWidth: 330,
    marginTop: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 3,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pine,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.paper,
  },
  identityCopy: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    flexShrink: 1,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 22,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.pineSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  statCopy: {
    flex: 1,
    gap: 1,
  },
  statValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  claim: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.sand,
    gap: 12,
  },
  claimHead: {
    flexDirection: "row",
    gap: 11,
  },
  claimIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,253,248,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  claimCopy: {
    flex: 1,
    gap: 3,
  },
  claimBody: {
    lineHeight: 18,
  },
  claimButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
  },
  actions: {
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...shadowSoft,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pineSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  editCard: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 7,
  },
  editCopy: {
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 6,
  },
  field: {
    marginBottom: 2,
  },
  save: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  signOut: {
    marginTop: 20,
    marginHorizontal: 20,
    alignSelf: "flex-start",
  },
  note: {
    textAlign: "center",
    marginTop: 8,
  },
});
